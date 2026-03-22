import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { BsPlayFill, BsPauseFill, BsPencil, BsTrash } from 'react-icons/bs';
import SongCard from '../components/Cards/SongCard';
import usePlayerStore from '../store/playerStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const { playSong, setQueue, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const headerRef = useRef(null);

  useEffect(() => { fetchPlaylist(); }, [id]);

  useEffect(() => {
    if (playlist && headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, [playlist]);

  const fetchPlaylist = async () => {
    try {
      const r = await api.get(`/playlists/${id}`);
      setPlaylist(r.data.playlist);
      setEditName(r.data.playlist.name);
    } catch { navigate('/library'); }
    setLoading(false);
  };

  const handlePlay = () => {
    if (!playlist?.songs?.length) return;
    const isCurrentPlaylist = playlist.songs.some(s => s._id === currentSong?._id);
    if (isCurrentPlaylist) togglePlay();
    else setQueue(playlist.songs, 0);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return;
    try { await api.delete(`/playlists/${id}`); toast.success('Playlist deleted'); navigate('/library'); }
    catch { toast.error('Error deleting'); }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    try { await api.put(`/playlists/${id}`, { name: editName }); setPlaylist(p => ({ ...p, name: editName })); setEditing(false); toast.success('Renamed!'); }
    catch { toast.error('Error'); }
  };

  const removeSong = async (songId) => {
    try {
      await api.delete(`/playlists/${id}/songs/${songId}`);
      setPlaylist(p => ({ ...p, songs: p.songs.filter(s => s._id !== songId) }));
      toast.success('Song removed');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" /></div>;
  if (!playlist) return null;

  const isPlayingPlaylist = playlist.songs?.some(s => s._id === currentSong?._id) && isPlaying;

  return (
    <div className="fade-in">
      <div ref={headerRef} className="flex gap-8 mb-10 items-end">
        <div className="w-52 h-52 bg-gradient-to-br from-[#1DB954] to-[#148A08] rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden">
          {playlist.image
            ? <img src={playlist.image} alt="" className="w-full h-full object-cover" />
            : <span className="text-7xl">🎵</span>
          }
        </div>
        <div className="flex-1 min-w-0 pb-2">
          <p className="text-xs uppercase font-bold text-[#B3B3B3] mb-2">Playlist</p>
          {editing ? (
            <form onSubmit={handleRename} className="flex gap-2 mb-4">
              <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                className="bg-[#3E3E3E] text-white text-3xl font-bold rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-[#1DB954] flex-1" />
              <button type="submit" className="bg-[#1DB954] text-black px-4 py-1 rounded-full font-bold text-sm">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="text-[#B3B3B3] hover:text-white px-3">Cancel</button>
            </form>
          ) : (
            <h1 className="text-5xl font-bold text-white mb-4 truncate">{playlist.name}</h1>
          )}
          {playlist.description && <p className="text-[#B3B3B3] text-sm mb-3">{playlist.description}</p>}
          <p className="text-[#B3B3B3] text-sm">{playlist.songs?.length || 0} songs</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={handlePlay} disabled={!playlist.songs?.length}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50">
          {isPlayingPlaylist ? <BsPauseFill className="text-black text-2xl" /> : <BsPlayFill className="text-black text-2xl ml-1" />}
        </button>
        <button onClick={() => setEditing(!editing)} className="text-[#B3B3B3] hover:text-white transition-colors text-xl">
          <BsPencil />
        </button>
        <button onClick={handleDelete} className="text-[#B3B3B3] hover:text-red-500 transition-colors text-xl">
          <BsTrash />
        </button>
      </div>

      {/* Songs */}
      {playlist.songs?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white text-lg font-bold mb-2">No songs yet</p>
          <p className="text-[#B3B3B3] text-sm">Search for songs and add them to this playlist</p>
        </div>
      ) : (
        <div className="bg-[#181818] rounded-xl overflow-hidden">
          {playlist.songs.map((song, i) => (
            <div key={song._id} className="group relative">
              <SongCard song={song} queue={playlist.songs} showIndex index={i} />
              <button onClick={() => removeSong(song._id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-sm font-semibold">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
