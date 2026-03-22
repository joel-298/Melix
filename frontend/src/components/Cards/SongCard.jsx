import { useRef, useState } from 'react';
import { BsPlayFill, BsPauseFill, BsThreeDots } from 'react-icons/bs';
import { MdFavorite, MdFavoriteBorder, MdPlaylistAdd } from 'react-icons/md';
import usePlayerStore from '../../store/playerStore';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function SongCard({ song, queue = [], showIndex = false, index = 0 }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const [isFav, setIsFav] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const isCurrentSong = currentSong?._id === song._id;

  const handlePlay = () => {
    if (isCurrentSong) togglePlay();
    else playSong(song, queue.length > 0 ? queue : [song]);
  };

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Login required');
    try {
      const res = await api.post(`/favourites/${song._id}`);
      setIsFav(res.data.isFavourite);
      toast.success(res.data.message);
    } catch {}
  };

  const openMenu = async (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
    if (!showMenu && isAuthenticated) {
      try { const res = await api.get('/playlists'); setPlaylists(res.data.playlists || []); } catch {}
    }
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId: song._id });
      toast.success('Added to playlist!');
      setShowMenu(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const fmtTime = (s) => {
    if (!s) return '';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
        isCurrentSong ? 'bg-[#282828]' : 'hover:bg-[#282828]'
      }`}
    >
      {/* Index or playing icon */}
      <div className="w-6 text-center flex-shrink-0">
        {isCurrentSong && isPlaying ? (
          <div className="flex items-end justify-center gap-0.5 h-4">
            {[1,2,3].map(i => (
              <div key={i} className="w-0.5 bg-[#1DB954] animate-bounce" style={{ height: `${(i*4)}px`, animationDelay: `${i*0.1}s` }} />
            ))}
          </div>
        ) : (
          <>
            <span className={`text-sm text-[#B3B3B3] group-hover:hidden ${isCurrentSong ? 'text-[#1DB954]' : ''}`}>
              {showIndex ? index + 1 : ''}
            </span>
            <BsPlayFill className="text-white hidden group-hover:block mx-auto" />
          </>
        )}
      </div>

      {/* Image */}
      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
        <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrentSong ? 'text-[#1DB954]' : 'text-white'}`}>
          {song.name}
        </p>
        <p className="text-xs text-[#B3B3B3] truncate">{song.artist?.name}</p>
      </div>

      {/* Category */}
      <span className="text-xs text-[#B3B3B3] hidden md:block truncate max-w-[120px]">
        {song.category?.name}
      </span>

      {/* Duration */}
      <span className="text-xs text-[#B3B3B3] w-10 text-right">{fmtTime(song.duration)}</span>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button onClick={handleFav} className="text-lg hover:scale-110 transition-transform">
          {isFav ? <MdFavorite className="text-[#1DB954]" /> : <MdFavoriteBorder className="text-[#B3B3B3] hover:text-white" />}
        </button>
        <div className="relative">
          <button onClick={openMenu} className="text-lg text-[#B3B3B3] hover:text-white">
            <BsThreeDots />
          </button>
          {showMenu && (
            <div className="absolute bottom-8 right-0 bg-[#282828] rounded-lg shadow-2xl py-2 w-48 z-50 border border-[#3E3E3E]">
              <p className="text-xs text-[#B3B3B3] px-4 py-1 font-bold uppercase tracking-wider">Add to Playlist</p>
              {playlists.map(pl => (
                <button key={pl._id} onClick={() => addToPlaylist(pl._id)}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] transition-colors truncate">
                  {pl.name}
                </button>
              ))}
              {playlists.length === 0 && <p className="px-4 py-2 text-xs text-[#535353]">No playlists</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
