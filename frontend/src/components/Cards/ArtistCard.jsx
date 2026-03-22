import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function ArtistCard({ artist }) {
  const cardRef = useRef(null);

  const handleHover = () => {
    gsap.to(cardRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
  };
  const handleLeave = () => {
    gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
  };

  return (
    <Link to={`/artist/${artist._id}`}>
      <div ref={cardRef} onMouseEnter={handleHover} onMouseLeave={handleLeave}
        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl cursor-pointer transition-colors duration-300 text-center group">
        <div className="w-full aspect-square rounded-full overflow-hidden mb-4 mx-auto shadow-xl relative">
          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        </div>
        <p className="text-white font-bold text-sm truncate">{artist.name}</p>
        <p className="text-[#B3B3B3] text-xs mt-1">Artist</p>
      </div>
    </Link>
  );
}
