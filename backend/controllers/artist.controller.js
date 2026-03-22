const Artist = require('../models/Artist');
const { cloudinary } = require('../config/cloudinary');
const { cache, CACHE_KEYS, TTL } = require('../config/cache');

exports.createArtist = async (req, res) => {
  try {
    const { name, about } = req.body;
    const exists = await Artist.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ success: false, message: 'Artist already exists' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Artist image required' });
    const artist = await Artist.create({ name, about: about || '', image: req.file.path, imagePublicId: req.file.filename });
    cache.del(CACHE_KEYS.ALL_ARTISTS);
    res.status(201).json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllArtists = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEYS.ALL_ARTISTS);
    if (cached) return res.json({ success: true, artists: cached });
    const artists = await Artist.find().sort('name');
    cache.set(CACHE_KEYS.ALL_ARTISTS, artists, TTL.ARTISTS);
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const cKey = CACHE_KEYS.ARTIST(req.params.id);
    const cached = cache.get(cKey);
    if (cached) return res.json({ success: true, artist: cached });
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    cache.set(cKey, artist, TTL.ARTISTS);
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    const { name, about } = req.body;
    if (name) artist.name = name;
    if (about) artist.about = about;
    if (req.file) {
      if (artist.imagePublicId) await cloudinary.uploader.destroy(artist.imagePublicId);
      artist.image = req.file.path;
      artist.imagePublicId = req.file.filename;
    }
    await artist.save();
    cache.del(CACHE_KEYS.ALL_ARTISTS);
    cache.del(CACHE_KEYS.ARTIST(req.params.id));
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    if (artist.imagePublicId) await cloudinary.uploader.destroy(artist.imagePublicId);
    await artist.deleteOne();
    cache.del(CACHE_KEYS.ALL_ARTISTS);
    cache.del(CACHE_KEYS.ARTIST(req.params.id));
    res.json({ success: true, message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
