import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { BsPlayFill, BsPauseFill } from 'react-icons/bs';
import SongCard from '../components/Cards/SongCard';
import usePlayerStore from '../store/playerStore';
import api from '../utils/api';

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const { setQueue, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, s] = await Promise.all([api.get(`/artists/${id}`), api.get(`/songs/artist/${id}`)]);
        setArtist(a.data.artist);
        setSongs(s.data.songs || []);
      } catch {}
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (artist && heroRef.current) {
      gsap.fromTo(heroRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    }
  }, [artist]);

  if (!artist) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" /></div>;

  const isPlayingArtist = songs.some(s => s._id === currentSong?._id) && isPlaying;
  const handlePlay = () => {
    if (!songs.length) return;
    if (isPlayingArtist) togglePlay();
    else setQueue(songs, 0);
  };

  return (
    <div className="fade-in -mx-2">
      {/* Hero */}
      <div ref={heroRef} className="relative h-80 overflow-hidden">
        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#121212]" />
        <div className="absolute bottom-0 left-0 p-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#1DB954] rounded-full" />
            <span className="text-[#1DB954] text-xs font-bold uppercase tracking-wider">Verified Artist</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-2">{artist.name}</h1>
          <p className="text-white/70 text-sm">{songs.length} songs</p>
        </div>
      </div>

      <div className="px-8 pt-6">
        {/* Play button */}
        <div className="flex items-center gap-6 mb-8">
          <button onClick={handlePlay}
            className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-2xl">
            {isPlayingArtist ? <BsPauseFill className="text-black text-2xl" /> : <BsPlayFill className="text-black text-2xl ml-1" />}
          </button>
        </div>

        {/* About */}
        {artist.about && (
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">About</h2>
            <p className="text-[#B3B3B3] leading-relaxed whitespace-pre-line">{artist.about}</p>
          </div>
        )}

        {/* Songs */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
          <div className="bg-[#181818] rounded-xl overflow-hidden">
            {songs.map((song, i) => <SongCard key={song._id} song={song} queue={songs} showIndex index={i} />)}
            {songs.length === 0 && <p className="text-[#B3B3B3] p-4 text-sm">No songs yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
