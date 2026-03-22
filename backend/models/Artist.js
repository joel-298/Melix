const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Artist name required'], trim: true, unique: true },
  image: { type: String, required: [true, 'Artist image required'] },
  imagePublicId: { type: String, default: '' },
  about: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);
