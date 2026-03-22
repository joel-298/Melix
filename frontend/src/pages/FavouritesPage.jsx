import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { BsPlayFill, BsPauseFill } from 'react-icons/bs';
import { MdFavorite } from 'react-icons/md';
import SongCard from '../components/Cards/SongCard';
import usePlayerStore from '../store/playerStore';
import api from '../utils/api';

export default function FavouritesPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setQueue, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const headerRef = useRef(null);

  useEffect(() => {
    const fetchFavs = async () => {
      try { const r = await api.get('/favourites'); setSongs(r.data.favourites || []); } catch {}
      setLoading(false);
    };
    fetchFavs();
  }, []);

  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
    }
  }, [loading]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" /></div>;

  const isPlayingFavs = songs.some(s => s._id === currentSong?._id) && isPlaying;

  return (
    <div className="fade-in">
      <div ref={headerRef} className="flex gap-8 items-end mb-8">
        <div className="w-52 h-52 bg-gradient-to-br from-[#9B59B6] to-[#1DB954] rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
          <MdFavorite className="text-white text-8xl" />
        </div>
        <div>
          <p className="text-xs uppercase font-bold text-[#B3B3B3] mb-2">Playlist</p>
          <h1 className="text-5xl font-bold text-white mb-4">Liked Songs</h1>
          <p className="text-[#B3B3B3] text-sm">{songs.length} songs</p>
        </div>
      </div>

      {songs.length > 0 && (
        <button onClick={() => isPlayingFavs ? togglePlay() : setQueue(songs, 0)}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg mb-8">
          {isPlayingFavs ? <BsPauseFill className="text-black text-2xl" /> : <BsPlayFill className="text-black text-2xl ml-1" />}
        </button>
      )}

      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <MdFavorite className="text-6xl text-[#B3B3B3] mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Songs you like will appear here</h3>
          <p className="text-[#B3B3B3]">Save songs by tapping the heart icon</p>
        </div>
      ) : (
        <div className="bg-[#181818] rounded-xl overflow-hidden">
          {songs.map((song, i) => <SongCard key={song._id} song={song} queue={songs} showIndex index={i} />)}
        </div>
      )}
    </div>
  );
}
