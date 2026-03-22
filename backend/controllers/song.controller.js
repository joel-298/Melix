const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');
const { cache, CACHE_KEYS, TTL } = require('../config/cache');

exports.uploadSong = async (req, res) => {
  try {
    const { name, artistId, categoryId, duration } = req.body;
    if (!req.files?.songFile || !req.files?.songImage)
      return res.status(400).json({ success: false, message: 'Audio file and image are required' });
    
    const artist = await Artist.findById(artistId);
    const category = await Category.findById(categoryId);
    if (!artist || !category) return res.status(404).json({ success: false, message: 'Artist or category not found' });

    const song = await Song.create({
      name,
      file: req.files.songFile[0].path,
      filePublicId: req.files.songFile[0].filename,
      image: req.files.songImage[0].path,
      imagePublicId: req.files.songImage[0].filename,
      artist: artistId,
      category: categoryId,
      duration: duration || 0,
    });

    // Invalidate relevant caches
    cache.del(CACHE_KEYS.ALL_SONGS);
    cache.del(CACHE_KEYS.TRENDING);
    cache.del(CACHE_KEYS.NEW_RELEASES);
    cache.del(CACHE_KEYS.ARTIST_SONGS(artistId));
    cache.del(CACHE_KEYS.CATEGORY_SONGS(categoryId));

    const populated = await Song.findById(song._id).populate('artist').populate('category');
    res.status(201).json({ success: true, song: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllSongs = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEYS.ALL_SONGS);
    if (cached) return res.json({ success: true, songs: cached, fromCache: true });
    const songs = await Song.find().populate('artist').populate('category').sort('-createdAt');
    cache.set(CACHE_KEYS.ALL_SONGS, songs, TTL.SONGS);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const cKey = CACHE_KEYS.SONG(req.params.id);
    const cached = cache.get(cKey);
    if (cached) return res.json({ success: true, song: cached });
    const song = await Song.findById(req.params.id).populate('artist').populate('category');
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    cache.set(cKey, song, TTL.SONGS);
    res.json({ success: true, song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEYS.TRENDING);
    if (cached) return res.json({ success: true, songs: cached });
    const songs = await Song.find().sort('-listenCount').limit(20).populate('artist').populate('category');
    cache.set(CACHE_KEYS.TRENDING, songs, TTL.TRENDING);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNewReleases = async (req, res) => {
  try {
    const cached = cache.get(CACHE_KEYS.NEW_RELEASES);
    if (cached) return res.json({ success: true, songs: cached });
    const songs = await Song.find().sort('-createdAt').limit(20).populate('artist').populate('category');
    cache.set(CACHE_KEYS.NEW_RELEASES, songs, TTL.SONGS);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.incrementListen = async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { listenCount: 1 } });
    cache.del(CACHE_KEYS.TRENDING);
    cache.del(CACHE_KEYS.SONG(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSongsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const cKey = CACHE_KEYS.ARTIST_SONGS(artistId);
    const cached = cache.get(cKey);
    if (cached) return res.json({ success: true, songs: cached });
    const songs = await Song.find({ artist: artistId }).populate('artist').populate('category');
    cache.set(cKey, songs, TTL.SONGS);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSongsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const cKey = CACHE_KEYS.CATEGORY_SONGS(categoryId);
    const cached = cache.get(cKey);
    if (cached) return res.json({ success: true, songs: cached });
    const songs = await Song.find({ category: categoryId }).populate('artist').populate('category');
    cache.set(cKey, songs, TTL.SONGS);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    if (song.filePublicId) await cloudinary.uploader.destroy(song.filePublicId, { resource_type: 'video' });
    if (song.imagePublicId) await cloudinary.uploader.destroy(song.imagePublicId);
    await song.deleteOne();
    cache.del(CACHE_KEYS.ALL_SONGS);
    cache.del(CACHE_KEYS.SONG(req.params.id));
    cache.del(CACHE_KEYS.TRENDING);
    res.json({ success: true, message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
