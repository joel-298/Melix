const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const { createCategory, getAllCategories, deleteCategory } = require('../controllers/category.controller');

router.get('/', getAllCategories);
router.post('/', protect, adminOnly, uploadImage.single('image'), createCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
