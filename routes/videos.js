const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Video = require('../models/Video');
const cloudinary = require('../config/cloudinary');

const router = express.Router();
const metadataFilePath = path.join(__dirname, '..', 'uploads', 'metadata.json');

const readMetadata = () => {
  if (!fs.existsSync(metadataFilePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));
  } catch {
    return [];
  }
};

const writeMetadata = (items) => {
  fs.mkdirSync(path.dirname(metadataFilePath), { recursive: true });
  fs.writeFileSync(metadataFilePath, JSON.stringify(items, null, 2));
};

const getFallbackVideos = () =>
  readMetadata().sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

const removeFallbackVideo = (id) =>
  writeMetadata(readMetadata().filter((v) => v._id !== id));

const tmpDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `tmp-${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 100 }
});

router.get('/health', (req, res) => {
  res.json({
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    },
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

router.post('/auth', (req, res) => {
  const adminKey = req.header('x-admin-key');
  if (adminKey === process.env.ADMIN_KEY) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ message: 'Invalid admin key' });
});

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    if (mongoose.connection.readyState !== 1) {
      const allVideos = getFallbackVideos();
      const q = (req.query.q || '').trim().toLowerCase();
      const filtered = q
        ? allVideos.filter((v) => v.title.toLowerCase().includes(q))
        : allVideos;
      const count = filtered.length;
      return res.json({
        videos: filtered.slice((page - 1) * limit, page * limit),
        count, page, limit,
        totalPages: Math.max(1, Math.ceil(count / limit))
      });
    }

    const query = {};
    if (req.query.q) query.title = { $regex: req.query.q, $options: 'i' };

    const count = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ videos, count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Fetch videos error:', error.message);
    return res.status(500).json({ message: 'Cannot fetch videos' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  const adminKey = req.header('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!req.file || !req.body.title) {
    return res.status(400).json({ message: 'Title and file are required' });
  }

  const tempFilePath = req.file.path;

  try {
    const baseName = req.file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-]/g, '_')
      .slice(0, 80);

    const result = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: 'video',
      folder: 'vidshop',
      public_id: `${Date.now()}-${baseName}`
    });

    fs.unlink(tempFilePath, () => {});

    const uploadData = {
      title: req.body.title,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const video = await Video.create(uploadData);
      return res.status(201).json(video);
    }

    const fallbackVideo = {
      _id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      ...uploadData
    };
    const items = readMetadata();
    items.push(fallbackVideo);
    writeMetadata(items);
    return res.status(201).json(fallbackVideo);
  } catch (error) {
    fs.unlink(tempFilePath, () => {});
    console.error('Upload error:', error.message);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Video too large. Max size is 100MB.' });
  }
  next(err);
});

router.delete('/:id', async (req, res) => {
  const adminKey = req.header('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    let video = null;

    if (mongoose.connection.readyState === 1) {
      video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ message: 'Video not found' });

      if (video.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' });
      } else if (video.filename) {
        const filePath = path.join(__dirname, '..', 'uploads', video.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await Video.deleteOne({ _id: req.params.id });
      return res.json({ message: 'Video deleted successfully' });
    }

    const fallbackVideos = readMetadata();
    video = fallbackVideos.find((v) => v._id === req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' });
    }
    removeFallbackVideo(req.params.id);
    return res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    return res.status(500).json({ message: 'Could not delete video', error: error.message });
  }
});

router.get('/:id/stream', async (req, res) => {
  try {
    let video = null;
    if (mongoose.connection.readyState === 1) {
      video = await Video.findById(req.params.id);
    } else {
      video = readMetadata().find((v) => v._id === req.params.id);
    }
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (!video.cloudinaryUrl) return res.status(404).json({ message: 'No stream URL available' });

    return res.redirect(video.cloudinaryUrl);
  } catch (error) {
    console.error('Stream error:', error.message);
    return res.status(500).json({ message: 'Stream failed' });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    let video = null;
    if (mongoose.connection.readyState === 1) {
      video = await Video.findById(req.params.id);
    } else {
      video = readMetadata().find((v) => v._id === req.params.id);
    }
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.cloudinaryPublicId) {
      const downloadUrl = cloudinary.url(video.cloudinaryPublicId, {
        resource_type: 'video',
        flags: `attachment:${video.originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        secure: true
      });
      return res.redirect(downloadUrl);
    }

    if (video.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', video.filename);
      return res.download(filePath, video.originalName || video.filename);
    }

    return res.status(404).json({ message: 'File not available' });
  } catch (error) {
    console.error('Download error:', error.message);
    return res.status(500).json({ message: 'Download failed' });
  }
});

module.exports = router;
