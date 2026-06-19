const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cloudinaryUrl: { type: String },
  cloudinaryPublicId: { type: String },
  filename: { type: String },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
