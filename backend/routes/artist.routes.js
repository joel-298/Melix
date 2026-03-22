const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const { createArtist, getAllArtists, getArtistById, updateArtist, deleteArtist } = require('../controllers/artist.controller');

router.get('/', getAllArtists);
router.get('/:id', getArtistById);
router.post('/', protect, adminOnly, uploadImage.single('image'), createArtist);
router.put('/:id', protect, adminOnly, uploadImage.single('image'), updateArtist);
router.delete('/:id', protect, adminOnly, deleteArtist);

module.exports = router;
