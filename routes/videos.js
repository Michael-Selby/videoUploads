const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Video = require('../models/Video');

const router = express.Router();
const metadataFilePath = path.join(__dirname, '..', 'uploads', 'metadata.json');

const readMetadata = () => {
  if (!fs.existsSync(metadataFilePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(metadataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const writeMetadata = (items) => {
  fs.writeFileSync(metadataFilePath, JSON.stringify(items, null, 2));
};

const getFallbackVideos = () => {
  const items = readMetadata();
  return items.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

const saveFallbackVideo = (video) => {
  const items = readMetadata();
  items.push(video);
  writeMetadata(items);
  return video;
};

const removeFallbackVideo = (id) => {
  const items = readMetadata().filter((video) => video._id !== id);
  writeMetadata(items);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

router.post('/auth', (req, res) => {
  const adminKey = req.header('x-admin-key');
  if (adminKey === process.env.ADMIN_KEY) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ message: 'Invalid admin key' });
});

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 500 } });

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    if (mongoose.connection.readyState !== 1) {
      const allVideos = getFallbackVideos();
      const query = (req.query.q || '').trim().toLowerCase();
      const filtered = query
        ? allVideos.filter((video) => video.title.toLowerCase().includes(query))
        : allVideos;

      const count = filtered.length;
      const videos = filtered.slice((page - 1) * limit, page * limit);

      return res.json({
        videos,
        count,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(count / limit))
      });
    }

    const query = {};
    if (req.query.q) {
      query.title = { $regex: req.query.q, $options: 'i' };
    }

    const count = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      videos,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });
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

  try {
    const uploadData = {
      title: req.body.title,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      const video = await Video.create(uploadData);
      return res.status(201).json(video);
    }

    const fallbackVideo = saveFallbackVideo({
      _id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      ...uploadData
    });
    return res.status(201).json(fallbackVideo);
  } catch (error) {
    console.error('Upload save error:', error.message);
    return res.status(500).json({
      message: 'Could not save video',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  const adminKey = req.header('x-admin-key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const filePath = path.join(__dirname, '..', 'uploads', video.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await Video.deleteOne({ _id: req.params.id });
      return res.json({ message: 'Video deleted successfully' });
    }

    const fallbackVideos = readMetadata();
    const video = fallbackVideos.find((item) => item._id === req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    removeFallbackVideo(req.params.id);
    return res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    return res.status(500).json({ message: 'Could not delete video', error: error.message });
  }
});

router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Video file too large. Max size is 500MB.' });
  }
  next(err);
});

router.get('/:id/download', async (req, res) => {
  try {
    let video = null;

    if (mongoose.connection.readyState === 1) {
      video = await Video.findById(req.params.id);
    } else {
      const fallbackVideos = readMetadata();
      video = fallbackVideos.find((item) => item._id === req.params.id);
    }

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', video.filename);
    return res.download(filePath, video.originalName || video.originalName || video.filename);
  } catch (error) {
    console.error('Download error:', error.message);
    return res.status(500).json({ message: 'Download failed' });
  }
});

module.exports = router;
