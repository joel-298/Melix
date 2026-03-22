const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');
const { cache, CACHE_KEYS, TTL } = require('../config/cache');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Category image required' });
    const category = await Category.create({ name, image: req.file.path, imagePublicId: req.file.filename });
    cache.del(CACHE_KEYS.ALL_CATEGORIES);
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEYS.ALL_CATEGORIES);
    if (cached) return res.json({ success: true, categories: cached });
    const categories = await Category.find().sort('name');
    cache.set(CACHE_KEYS.ALL_CATEGORIES, categories, TTL.CATEGORIES);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    if (category.imagePublicId) await cloudinary.uploader.destroy(category.imagePublicId);
    await category.deleteOne();
    cache.del(CACHE_KEYS.ALL_CATEGORIES);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
