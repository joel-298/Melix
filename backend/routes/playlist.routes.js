const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const { createPlaylist, getUserPlaylists, getPlaylistById, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist, updatePlaylist } = require('../controllers/playlist.controller');

router.use(protect);
router.get('/', getUserPlaylists);
router.post('/', uploadImage.single('image'), createPlaylist);
router.get('/:id', getPlaylistById);
router.put('/:id', uploadImage.single('image'), updatePlaylist);
router.delete('/:id', deletePlaylist);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

module.exports = router;
