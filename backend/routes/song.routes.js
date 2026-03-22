const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImage, uploadAudio } = require('../config/cloudinary');
const {
  uploadSong, getAllSongs, getSongById, getTrending, getNewReleases,
  incrementListen, getSongsByArtist, getSongsByCategory, deleteSong
} = require('../controllers/song.controller');

const uploadFields = require('multer')({ dest: '/tmp' }).fields([
  { name: 'songFile', maxCount: 1 },
  { name: 'songImage', maxCount: 1 }
]);

// Custom multer for multiple cloudinary fields
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');

const multiStorage = multer({
  storage: {
    _handleFile(req, file, cb) {
      const isAudio = ['audio/mpeg','audio/mp4','audio/wav','audio/x-m4a','video/mp4'].includes(file.mimetype);
      const folder = isAudio ? 'melix/audio' : 'melix/images';
      const resourceType = isAudio ? 'video' : 'image';
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (err, result) => {
          if (err) return cb(err);
          file.path = result.secure_url;
          file.filename = result.public_id;
          cb(null, file);
        }
      );
      file.stream.pipe(uploadStream);
    },
    _removeFile(req, file, cb) { cb(null); }
  },
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.get('/', getAllSongs);
router.get('/trending', getTrending);
router.get('/new-releases', getNewReleases);
router.get('/artist/:artistId', getSongsByArtist);
router.get('/category/:categoryId', getSongsByCategory);
router.get('/:id', getSongById);
router.post('/listen/:id', incrementListen);
router.post('/', protect, adminOnly, multiStorage.fields([{ name: 'songFile', maxCount: 1 }, { name: 'songImage', maxCount: 1 }]), uploadSong);
router.delete('/:id', protect, adminOnly, deleteSong);

module.exports = router;
