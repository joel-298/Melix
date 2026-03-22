import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  BsPlayFill, BsPauseFill, BsSkipStartFill, BsSkipEndFill,
  BsArrowRepeat, BsShuffle, BsVolumeUp, BsVolumeMute,
  BsDownload
} from 'react-icons/bs';
import { MdOutlineReplay10, MdOutlineForward10 } from 'react-icons/md';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import usePlayerStore from '../../store/playerStore';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const {
    currentSong, isPlaying, volume, currentTime, duration,
    repeat, shuffle, audioRef,
    setAudioRef, togglePlay, nextSong, prevSong, seek,
    forward10, backward10, setVolume, setCurrentTime, setDuration,
    cycleRepeat, toggleShuffle, onSongEnd
  } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const playerRef = useRef(null);
  const albumRef = useRef(null);
  const audioEl = useRef(null);
  const [isFav, setIsFav] = useState(false);
  const [prevVol, setPrevVol] = useState(1);

  useEffect(() => {
    setAudioRef(audioEl.current);
  }, []);

  useEffect(() => {
    if (currentSong) {
      gsap.fromTo(playerRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(albumRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
      checkFav();
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying && albumRef.current) {
      gsap.to(albumRef.current, { rotation: 360, duration: 20, repeat: -1, ease: 'none', id: 'spin' });
    } else {
      gsap.killTweensOf(albumRef.current);
    }
  }, [isPlaying]);

  const checkFav = async () => {
    if (!isAuthenticated || !currentSong) return;
    try {
      const res = await api.get(`/favourites/check/${currentSong._id}`);
      setIsFav(res.data.isFavourite);
    } catch {}
  };

  const toggleFav = async () => {
    if (!isAuthenticated) return toast.error('Login required');
    try {
      const res = await api.post(`/favourites/${currentSong._id}`);
      setIsFav(res.data.isFavourite);
      toast.success(res.data.message);
    } catch {}
  };

  const handleDownload = () => {
    if (!currentSong) return;
    const a = document.createElement('a');
    a.href = currentSong.file;
    a.download = `${currentSong.name}.mp3`;
    a.target = '_blank';
    a.click();
  };

  const toggleMute = () => {
    if (volume > 0) { setPrevVol(volume); setVolume(0); }
    else setVolume(prevVol || 1);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Always mount <audio> so playerStore.audioRef is set before any song is chosen */}
      <audio
        ref={audioEl}
        onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={onSongEnd}
        onPlay={() => usePlayerStore.setState({ isPlaying: true })}
        onPause={() => usePlayerStore.setState({ isPlaying: false })}
      />
      {!currentSong ? (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-[#282828] flex items-center justify-center z-30">
          <p className="text-[#535353] text-sm">Select a song to play</p>
        </div>
      ) : (
      <div ref={playerRef} className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#282828] z-30 px-4 py-3">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 group cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * duration);
          }}>
          <div className="h-1 bg-[#535353] group-hover:h-1.5 transition-all">
            <div className="h-full bg-[#1DB954] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Song Info */}
          <div className="flex items-center gap-3 w-64 flex-shrink-0">
            <div ref={albumRef} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <img src={currentSong.image} alt={currentSong.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentSong.name}</p>
              <p className="text-[#B3B3B3] text-xs truncate">{currentSong.artist?.name}</p>
            </div>
            <button onClick={toggleFav} className="text-xl ml-1 flex-shrink-0 transition-transform hover:scale-110">
              {isFav ? <MdFavorite className="text-[#1DB954]" /> : <MdFavoriteBorder className="text-[#B3B3B3] hover:text-white" />}
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-lg">
            <div className="flex items-center gap-4">
              <button onClick={toggleShuffle} className={`text-xl transition-colors ${shuffle ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}>
                <BsShuffle />
              </button>
              <button onClick={prevSong} className="text-2xl text-[#B3B3B3] hover:text-white transition-colors hover:scale-110 active:scale-95">
                <BsSkipStartFill />
              </button>
              <button onClick={backward10} className="text-xl text-[#B3B3B3] hover:text-white transition-colors">
                <MdOutlineReplay10 />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
              >
                {isPlaying
                  ? <BsPauseFill className="text-black text-xl" />
                  : <BsPlayFill className="text-black text-xl ml-0.5" />
                }
              </button>
              <button onClick={forward10} className="text-xl text-[#B3B3B3] hover:text-white transition-colors">
                <MdOutlineForward10 />
              </button>
              <button onClick={nextSong} className="text-2xl text-[#B3B3B3] hover:text-white transition-colors hover:scale-110 active:scale-95">
                <BsSkipEndFill />
              </button>
              <button onClick={cycleRepeat} className={`text-xl transition-colors relative ${repeat !== 'none' ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}>
                <BsArrowRepeat />
                {repeat === 'one' && <span className="absolute -top-1 -right-1 text-[8px] bg-[#1DB954] text-black rounded-full w-3 h-3 flex items-center justify-center font-bold">1</span>}
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-[#B3B3B3] w-10 text-right">{fmtTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-[#535353] rounded-full cursor-pointer group"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek((e.clientX - rect.left) / rect.width * duration);
                }}>
                <div className="h-full bg-[#1DB954] rounded-full group-hover:bg-white transition-colors" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-[#B3B3B3] w-10">{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Download */}
          <div className="flex items-center gap-3 w-64 justify-end">
            <button onClick={handleDownload} className="text-lg text-[#B3B3B3] hover:text-[#1DB954] transition-colors" title="Download">
              <BsDownload />
            </button>
            <button onClick={toggleMute} className="text-xl text-[#B3B3B3] hover:text-white transition-colors">
              {volume === 0 ? <BsVolumeMute /> : <BsVolumeUp />}
            </button>
            <div className="w-24 h-1 bg-[#535353] rounded-full cursor-pointer group"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
              }}>
              <div className="h-full bg-white rounded-full group-hover:bg-[#1DB954] transition-colors" style={{ width: `${volume * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
