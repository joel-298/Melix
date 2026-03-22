import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { BsPlusCircleFill } from 'react-icons/bs';
import { MdClose } from 'react-icons/md';
import PlaylistCard from '../components/Cards/PlaylistCard';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => { fetchPlaylists(); }, []);

  useEffect(() => {
    if (playlists.length && gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [playlists]);

  const fetchPlaylists = async () => {
    try { const r = await api.get('/playlists'); setPlaylists(r.data.playlists || []); } catch {}
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Playlist name required');
    setCreating(true);
    try {
      await api.post('/playlists', { name: name.trim(), description: desc.trim() });
      toast.success('Playlist created!');
      setName(''); setDesc(''); setShowModal(false);
      fetchPlaylists();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setCreating(false);
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Your Library</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1DB954] text-black font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-transform text-sm">
          <BsPlusCircleFill /> New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-20 h-20 bg-[#282828] rounded-full flex items-center justify-center mb-4">
            <BsPlusCircleFill className="text-4xl text-[#B3B3B3]" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Create your first playlist</h3>
          <p className="text-[#B3B3B3] mb-6">It's easy, we'll help you</p>
          <button onClick={() => setShowModal(true)}
            className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
            Create playlist
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map(pl => <PlaylistCard key={pl._id} playlist={pl} />)}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#282828] rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
              <button onClick={() => setShowModal(false)} className="text-[#B3B3B3] hover:text-white text-2xl"><MdClose /></button>
            </div>
            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="My Playlist #1"
                  className="w-full bg-[#3E3E3E] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add an optional description"
                  rows={3} className="w-full bg-[#3E3E3E] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm resize-none" />
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-transform">
                {creating ? 'Creating...' : 'Create Playlist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
