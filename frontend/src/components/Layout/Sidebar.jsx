import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { AiFillHome } from 'react-icons/ai';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdLibraryMusic, MdFavorite } from 'react-icons/md';
import { BsMusicNoteList, BsPlusSquare } from 'react-icons/bs';
import { FiLogOut, FiUpload } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const [playlists, setPlaylists] = useState([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(sidebarRef.current,
      { x: -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    );
    if (user) fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const res = await api.get('/playlists');
      setPlaylists(res.data.playlists || []);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  const navCls = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
    }`;

  return (
    <aside ref={sidebarRef} className="w-64 bg-black flex flex-col h-screen fixed left-0 top-0 z-20 overflow-hidden">
      <div className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#1DB954] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <MdLibraryMusic className="text-black text-lg" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Melix</span>
        </Link>
      </div>

      <nav className="px-3 space-y-0.5">
        <NavLink to="/" className={navCls} end><AiFillHome className="text-xl" />Home</NavLink>
        <NavLink to="/search" className={navCls}><AiOutlineSearch className="text-xl" />Search</NavLink>
        <NavLink to="/library" className={navCls}><MdLibraryMusic className="text-xl" />Your Library</NavLink>
        <NavLink to="/favourites" className={navCls}><MdFavorite className="text-xl" />Favourites</NavLink>
      </nav>

      <div className="border-t border-[#282828] my-4 mx-3" />

      <div className="px-3 flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#B3B3B3] uppercase tracking-widest">Playlists</span>
          <Link to="/library" className="text-[#B3B3B3] hover:text-[#1DB954] transition-colors">
            <BsPlusSquare className="text-lg" />
          </Link>
        </div>
        <div className="overflow-y-auto space-y-0.5 flex-1 pr-1">
          {playlists.map(pl => (
            <NavLink key={pl._id} to={`/playlist/${pl._id}`} className={navCls}>
              <div className="w-5 h-5 bg-[#282828] rounded flex items-center justify-center flex-shrink-0">
                {pl.image
                  ? <img src={pl.image} alt="" className="w-5 h-5 rounded object-cover" />
                  : <BsMusicNoteList className="text-xs text-[#B3B3B3]" />
                }
              </div>
              <span className="truncate">{pl.name}</span>
            </NavLink>
          ))}
          {playlists.length === 0 && (
            <p className="text-xs text-[#535353] px-4 py-2">No playlists yet</p>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-[#282828] space-y-0.5">
        {user?.role === 'admin' && (
          <NavLink to="/upload" className={navCls}>
            <FiUpload className="text-xl text-[#1DB954]" />
            <span className="text-[#1DB954]">Upload Music</span>
          </NavLink>
        )}
        <NavLink to="/profile" className={navCls}>
          <div className="w-6 h-6 rounded-full overflow-hidden bg-[#282828] flex items-center justify-center flex-shrink-0">
            {user?.profileImage
              ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-[#1DB954]">{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <span className="truncate">{user?.name}</span>
        </NavLink>
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-2.5 text-sm font-semibold text-[#B3B3B3] hover:text-white transition-colors w-full rounded-lg hover:bg-[#282828]">
          <FiLogOut className="text-xl" />Logout
        </button>
      </div>
    </aside>
  );
}
