import { Link } from 'react-router-dom';
import { BsMusicNoteList } from 'react-icons/bs';

export default function PlaylistCard({ playlist }) {
  return (
    <Link to={`/playlist/${playlist._id}`}>
      <div className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl cursor-pointer transition-colors duration-300 group">
        <div className="w-full aspect-square rounded-lg overflow-hidden mb-4 bg-[#282828] flex items-center justify-center shadow-xl">
          {playlist.image
            ? <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <BsMusicNoteList className="text-[#B3B3B3] text-5xl" />
          }
        </div>
        <p className="text-white font-bold text-sm truncate">{playlist.name}</p>
        <p className="text-[#B3B3B3] text-xs mt-1 truncate">{playlist.songs?.length || 0} songs</p>
      </div>
    </Link>
  );
}
