import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { BsPlayFill } from 'react-icons/bs';
import SongCard from '../components/Cards/SongCard';
import ArtistCard from '../components/Cards/ArtistCard';
import CategoryCard from '../components/Cards/CategoryCard';
import usePlayerStore from '../store/playerStore';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80',
];

function Section({ title, link, children, animRef }) {
  return (
    <section ref={animRef} className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {link && <Link to={link} className="text-sm text-[#B3B3B3] hover:text-white transition-colors font-semibold">Show all</Link>}
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const { playSong, setQueue } = usePlayerStore();
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroImg, setHeroImg] = useState(0);
  const heroRef = useRef(null);
  const trendRef = useRef(null);
  const newRef = useRef(null);
  const artistRef = useRef(null);
  const catRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMGS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sections = [trendRef, newRef, artistRef, catRef].map(r => r.current).filter(Boolean);
    gsap.fromTo(sections,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
    );
  }, [trending]);

  const fetchData = async () => {
    try {
      const [t, n, a, c] = await Promise.all([
        api.get('/songs/trending'),
        api.get('/songs/new-releases'),
        api.get('/artists'),
        api.get('/categories'),
      ]);
      setTrending(t.data.songs || []);
      setNewReleases(n.data.songs || []);
      setArtists(a.data.artists || []);
      setCategories(c.data.categories || []);
    } catch {}
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div ref={heroRef} className="relative h-72 rounded-2xl overflow-hidden mb-10 -mx-2">
        <img src={HERO_IMGS[heroImg]} alt="hero" className="w-full h-full object-cover transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {greeting()}{user ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-[#B3B3B3] mb-4">Discover your next favorite song</p>
          {trending[0] && (
            <button onClick={() => setQueue(trending, 0)}
              className="flex items-center gap-2 bg-[#1DB954] text-black font-bold px-6 py-2.5 rounded-full w-fit hover:scale-105 active:scale-95 transition-transform">
              <BsPlayFill className="text-xl" /> Play Trending
            </button>
          )}
        </div>
        {/* Dots */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroImg(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === heroImg ? 'bg-white w-4' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      {/* Trending */}
      <Section title="🔥 Trending Now" animRef={trendRef}>
        <div className="bg-[#181818] rounded-xl overflow-hidden">
          {trending.slice(0, 8).map((song, i) => (
            <SongCard key={song._id} song={song} queue={trending} showIndex index={i} />
          ))}
          {trending.length === 0 && <p className="text-[#B3B3B3] text-sm p-4">No songs yet</p>}
        </div>
      </Section>

      {/* New Releases */}
      <Section title="✨ New Releases" animRef={newRef}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {newReleases.slice(0, 10).map(song => (
            <div key={song._id} onClick={() => playSong(song, newReleases)}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl cursor-pointer transition-colors group">
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                <img src={song.image} alt={song.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <BsPlayFill className="text-black text-lg ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-white text-sm font-semibold truncate">{song.name}</p>
              <p className="text-[#B3B3B3] text-xs truncate mt-1">{song.artist?.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Artists */}
      <Section title="🎤 Popular Artists" link="/artists" animRef={artistRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artists.slice(0, 6).map(a => <ArtistCard key={a._id} artist={a} />)}
        </div>
      </Section>

      {/* Categories */}
      <Section title="🎵 Browse Categories" link="/categories" animRef={catRef}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((c, i) => <CategoryCard key={c._id} category={c} index={i} />)}
        </div>
      </Section>
    </div>
  );
}
