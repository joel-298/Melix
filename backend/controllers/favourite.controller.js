const Favourite = require('../models/Favourite');
const Song = require('../models/Song');

exports.toggleFavourite = async (req, res) => {
  try {
    const { songId } = req.params;
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    const existing = await Favourite.findOne({ user: req.user._id, song: songId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, isFavourite: false, message: 'Removed from favourites' });
    }
    await Favourite.create({ user: req.user._id, song: songId });
    res.json({ success: true, isFavourite: true, message: 'Added to favourites' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFavourites = async (req, res) => {
  try {
    const favs = await Favourite.find({ user: req.user._id })
      .populate({ path: 'song', populate: [{ path: 'artist' }, { path: 'category' }] })
      .sort('-createdAt');
    res.json({ success: true, favourites: favs.map(f => f.song).filter(Boolean) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkFavourite = async (req, res) => {
  try {
    const fav = await Favourite.findOne({ user: req.user._id, song: req.params.songId });
    res.json({ success: true, isFavourite: !!fav });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
