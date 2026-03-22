const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const { updateProfile, changePassword } = require('../controllers/user.controller');

router.use(protect);
router.put('/profile', uploadImage.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
