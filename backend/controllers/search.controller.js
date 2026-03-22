const Fuse = require('fuse.js');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Category = require('../models/Category');
const { cache, CACHE_KEYS, TTL } = require('../config/cache');

exports.search = async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;
    if (!q || q.trim().length < 1)
      return res.json({ success: true, results: { songs: [], artists: [], categories: [] } });

    const query = q.trim();
    const cKey = CACHE_KEYS.SEARCH(query);
    const cached = cache.get(cKey);
    if (cached) return res.json({ success: true, results: cached, fromCache: true });

    const [songs, artists, categories] = await Promise.all([
      Song.find().populate('artist').populate('category'),
      Artist.find(),
      Category.find(),
    ]);

    const fuseOptions = { includeScore: true, threshold: 0.4, minMatchCharLength: 2 };

    const songFuse = new Fuse(songs, { ...fuseOptions, keys: ['name', 'artist.name', 'category.name'] });
    const artistFuse = new Fuse(artists, { ...fuseOptions, keys: ['name', 'about'] });
    const categoryFuse = new Fuse(categories, { ...fuseOptions, keys: ['name'] });

    const results = {
      songs: songFuse.search(query).slice(0, parseInt(limit)).map(r => r.item),
      artists: artistFuse.search(query).slice(0, 5).map(r => r.item),
      categories: categoryFuse.search(query).slice(0, 5).map(r => r.item),
    };

    cache.set(cKey, results, TTL.SEARCH);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
