const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { toggleFavourite, getFavourites, checkFavourite } = require('../controllers/favourite.controller');

router.use(protect);
router.get('/', getFavourites);
router.post('/:songId', toggleFavourite);
router.get('/check/:songId', checkFavourite);

module.exports = router;
