const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Category name required'], trim: true, unique: true },
  image: { type: String, required: [true, 'Category image required'] },
  imagePublicId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
