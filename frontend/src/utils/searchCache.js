// In-memory search cache for frontend - prevents repeat API hits
const searchCache = new Map();
const MAX_CACHE_SIZE = 50;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export const getCachedSearch = (query) => {
  const key = query.toLowerCase().trim();
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  return entry.data;
};

export const setCachedSearch = (query, data) => {
  const key = query.toLowerCase().trim();
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
};

export const clearSearchCache = () => searchCache.clear();
