import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BsPlayFill, BsPauseFill } from 'react-icons/bs';
import SongCard from '../components/Cards/SongCard';
import usePlayerStore from '../store/playerStore';
import api from '../utils/api';

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [songs, setSongs] = useState([]);
  const { setQueue, currentSong, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, s] = await Promise.all([api.get('/categories'), api.get(`/songs/category/${id}`)]);
        const cat = cats.data.categories.find(c => c._id === id);
        setCategory(cat);
        setSongs(s.data.songs || []);
      } catch {}
    };
    fetchData();
  }, [id]);

  if (!category) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" /></div>;
  const isPlayingCat = songs.some(s => s._id === currentSong?._id) && isPlaying;

  return (
    <div className="fade-in">
      <div className="flex gap-8 items-end mb-8">
        <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase font-bold text-[#B3B3B3] mb-2">Category</p>
          <h1 className="text-5xl font-bold text-white mb-4">{category.name}</h1>
          <p className="text-[#B3B3B3] text-sm">{songs.length} songs</p>
        </div>
      </div>

      <button onClick={() => songs.length && (isPlayingCat ? togglePlay() : setQueue(songs, 0))}
        className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg mb-8">
        {isPlayingCat ? <BsPauseFill className="text-black text-2xl" /> : <BsPlayFill className="text-black text-2xl ml-1" />}
      </button>

      <div className="bg-[#181818] rounded-xl overflow-hidden">
        {songs.map((song, i) => <SongCard key={song._id} song={song} queue={songs} showIndex index={i} />)}
        {songs.length === 0 && <p className="text-[#B3B3B3] p-4">No songs in this category yet</p>}
      </div>
    </div>
  );
}
