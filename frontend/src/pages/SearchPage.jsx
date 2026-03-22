import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import SongCard from '../components/Cards/SongCard';
import ArtistCard from '../components/Cards/ArtistCard';
import CategoryCard from '../components/Cards/CategoryCard';
import { getCachedSearch, setCachedSearch } from '../utils/searchCache';
import api from '../utils/api';

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [allSongs, setAllSongs] = useState([]);
  const inputRef = useRef(null);
  const LIMIT = 10;

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
    inputRef.current?.focus();
    if (query) doSearch(query, true);
  }, []);

  const doSearch = useCallback(
    debounce(async (q, reset = false) => {
      if (!q || q.trim().length < 1) { setResults(null); setAllSongs([]); return; }
      const cached = getCachedSearch(q);
      if (cached && reset) {
        setResults(cached);
        setAllSongs(cached.songs || []);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q)}&limit=50`);
        setCachedSearch(q, res.data.results);
        setResults(res.data.results);
        setAllSongs(reset ? res.data.results.songs : prev => [...prev, ...(res.data.results.songs || [])]);
        setPage(1);
      } catch {}
      setLoading(false);
    }, 350),
    []
  );

  const handleChange = (q) => {
    setQuery(q);
    setSearchParams(q ? { q } : {});
    doSearch(q, true);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
  };

  const displayedSongs = allSongs.slice(0, page * LIMIT);
  const hasMore = allSongs.length > displayedSongs.length;

  return (
    <div className="fade-in">
      {/* Big Search Input */}
      <div className="sticky top-0 bg-[#121212] pb-4 pt-2 z-10">
        <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 max-w-2xl">
          <AiOutlineSearch className="text-black text-2xl flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="What do you want to listen to?"
            className="bg-transparent text-black text-lg outline-none font-medium w-full placeholder-gray-500"
          />
          {query && (
            <button onClick={() => handleChange('')} className="text-gray-400 hover:text-black">
              <MdClose className="text-xl" />
            </button>
          )}
        </div>
      </div>

      {/* No query: show categories */}
      {!query && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Browse All</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c, i) => <CategoryCard key={c._id} category={c} index={i} />)}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && results && query && (
        <div>
          {results.songs?.length === 0 && results.artists?.length === 0 && results.categories?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white text-xl font-bold mb-2">No results found for "{query}"</p>
              <p className="text-[#B3B3B3]">Try different keywords or check your spelling</p>
            </div>
          )}

          {results.artists?.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map(a => <ArtistCard key={a._id} artist={a} />)}
              </div>
            </section>
          )}

          {results.categories?.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.categories.map((c, i) => <CategoryCard key={c._id} category={c} index={i} />)}
              </div>
            </section>
          )}

          {displayedSongs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">Songs</h2>
              <div className="bg-[#181818] rounded-xl overflow-hidden">
                {displayedSongs.map((song, i) => (
                  <SongCard key={song._id} song={song} queue={allSongs} showIndex index={i} />
                ))}
              </div>
              {hasMore && (
                <button onClick={loadMore}
                  className="mt-4 w-full py-3 text-sm text-[#B3B3B3] hover:text-white border border-[#282828] hover:border-white rounded-lg transition-colors font-semibold">
                  Load more results
                </button>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
