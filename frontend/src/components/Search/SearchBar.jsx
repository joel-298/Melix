import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import { getCachedSearch, setCachedSearch } from '../../utils/searchCache';
import api from '../../utils/api';
import usePlayerStore from '../../store/playerStore';

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

export default function SearchBar({ fullPage = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const { playSong } = usePlayerStore();
  const navigate = useNavigate();

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.trim().length < 1) { setResults(null); return; }
      const cached = getCachedSearch(q);
      if (cached) { setResults(cached); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q)}&limit=10`);
        setCachedSearch(q, res.data.results);
        setResults(res.data.results);
      } catch {}
      setLoading(false);
    }, 350),
    []
  );

  useEffect(() => { doSearch(query); }, [query]);

  const clear = () => { setQuery(''); setResults(null); };

  const totalResults = results ? results.songs.length + results.artists.length + results.categories.length : 0;

  return (
    <div className={`relative ${fullPage ? 'w-full max-w-2xl mx-auto' : 'w-full max-w-md'}`}>
      <div className={`flex items-center gap-3 bg-white rounded-full px-4 py-2.5 transition-all duration-200 ${focused ? 'ring-2 ring-white' : ''}`}>
        <AiOutlineSearch className="text-black text-xl flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="What do you want to listen to?"
          className="bg-transparent text-black placeholder-gray-500 outline-none text-sm font-medium w-full"
        />
        {query && (
          <button onClick={clear} className="text-gray-500 hover:text-black transition-colors">
            <MdClose />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {focused && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] rounded-xl shadow-2xl z-50 overflow-hidden border border-[#3E3E3E] max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!loading && totalResults === 0 && query.length > 1 && (
            <p className="p-4 text-[#B3B3B3] text-sm text-center">No results for "{query}"</p>
          )}
          {results?.songs?.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Songs</p>
              {results.songs.map(song => (
                <button key={song._id} onClick={() => { playSong(song, results.songs); clear(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3E3E3E] transition-colors text-left">
                  <img src={song.image} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{song.name}</p>
                    <p className="text-[#B3B3B3] text-xs truncate">{song.artist?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results?.artists?.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Artists</p>
              {results.artists.map(artist => (
                <button key={artist._id} onClick={() => { navigate(`/artist/${artist._id}`); clear(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3E3E3E] transition-colors text-left">
                  <img src={artist.image} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">{artist.name}</p>
                    <p className="text-[#B3B3B3] text-xs">Artist</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {results?.categories?.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Categories</p>
              {results.categories.map(cat => (
                <button key={cat._id} onClick={() => { navigate(`/category/${cat._id}`); clear(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3E3E3E] transition-colors text-left">
                  <img src={cat.image} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">{cat.name}</p>
                    <p className="text-[#B3B3B3] text-xs">Category</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {totalResults > 0 && (
            <button onClick={() => { navigate(`/search?q=${query}`); clear(); }}
              className="w-full py-3 text-sm text-[#1DB954] hover:text-white transition-colors border-t border-[#3E3E3E] font-semibold">
              See all results for "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
