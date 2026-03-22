const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Song name required'], trim: true },
  file: { type: String, required: [true, 'Audio file required'] },
  filePublicId: { type: String, default: '' },
  image: { type: String, required: [true, 'Song image required'] },
  imagePublicId: { type: String, default: '' },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  duration: { type: Number, default: 0 },
  listenCount: { type: Number, default: 0 },
}, { timestamps: true });

songSchema.index({ name: 'text' });

module.exports = mongoose.model('Song', songSchema);
