const NodeCache = require('node-cache');

// TTL values in seconds
const cache = new NodeCache({
  stdTTL: 300,        // 5 min default
  checkperiod: 60,    // cleanup every 1 min
  useClones: false,
});

const CACHE_KEYS = {
  ALL_SONGS: 'all_songs',
  ALL_ARTISTS: 'all_artists',
  ALL_CATEGORIES: 'all_categories',
  TRENDING: 'trending_songs',
  NEW_RELEASES: 'new_releases',
  SONG: (id) => `song_${id}`,
  ARTIST: (id) => `artist_${id}`,
  ARTIST_SONGS: (id) => `artist_songs_${id}`,
  CATEGORY_SONGS: (id) => `category_songs_${id}`,
  SEARCH: (query) => `search_${query.toLowerCase().trim()}`,
};

const TTL = {
  SONGS: 600,       // 10 min
  ARTISTS: 1800,    // 30 min
  CATEGORIES: 1800, // 30 min
  TRENDING: 300,    // 5 min
  SEARCH: 180,      // 3 min
};

module.exports = { cache, CACHE_KEYS, TTL };
