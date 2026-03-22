import { create } from 'zustand';
import api from '../utils/api';

const usePlayerStore = create((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  repeat: 'none', // 'none' | 'one' | 'all'
  shuffle: false,
  audioRef: null,

  setAudioRef: (ref) => {
    console.log('setAudioRef called with:', ref);
    set({ audioRef: ref });
  },

  playSong: (song, queue = null) => {
    const { audioRef } = get();
    console.log('audioRef:', audioRef);
    const newQueue = queue || [song];
    const idx = newQueue.findIndex(s => s._id === song._id);
    set({ currentSong: song, queue: newQueue, queueIndex: idx >= 0 ? idx : 0, isPlaying: true });
    if (audioRef) {
      console.log('Playing song:', song.file);
      audioRef.src = song.file;
      audioRef.load();
      audioRef.play().catch((err) => {
        console.error('Play failed:', err);
        set({ isPlaying: false });
        // Optionally show toast
        // toast.error('Unable to play song');
      });
    }
    api.post(`/songs/listen/${song._id}`).catch(() => {});
  },

  togglePlay: () => {
    const { audioRef, isPlaying } = get();
    if (!audioRef) return;
    if (isPlaying) { audioRef.pause(); set({ isPlaying: false }); }
    else { audioRef.play().catch(() => {}); set({ isPlaying: true }); }
  },

  nextSong: () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (!queue.length) return;
    let nextIdx;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    else if (queueIndex < queue.length - 1) nextIdx = queueIndex + 1;
    else if (repeat === 'all') nextIdx = 0;
    else return;
    get().playSong(queue[nextIdx], queue);
    set({ queueIndex: nextIdx });
  },

  prevSong: () => {
    const { queue, queueIndex, audioRef } = get();
    if (audioRef && audioRef.currentTime > 3) { audioRef.currentTime = 0; return; }
    if (queueIndex > 0) {
      const newIdx = queueIndex - 1;
      get().playSong(queue[newIdx], queue);
      set({ queueIndex: newIdx });
    }
  },

  seek: (time) => {
    const { audioRef } = get();
    if (audioRef) { audioRef.currentTime = time; set({ currentTime: time }); }
  },

  forward10: () => {
    const { audioRef, currentTime, duration } = get();
    if (audioRef) { const t = Math.min(currentTime + 10, duration); audioRef.currentTime = t; }
  },

  backward10: () => {
    const { audioRef, currentTime } = get();
    if (audioRef) { const t = Math.max(currentTime - 10, 0); audioRef.currentTime = t; }
  },

  setVolume: (vol) => {
    const { audioRef } = get();
    if (audioRef) audioRef.volume = vol;
    set({ volume: vol });
  },

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),

  cycleRepeat: () => {
    const { repeat } = get();
    const next = repeat === 'none' ? 'all' : repeat === 'all' ? 'one' : 'none';
    set({ repeat: next });
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),

  setQueue: (songs, startIndex = 0) => {
    set({ queue: songs, queueIndex: startIndex });
    get().playSong(songs[startIndex], songs);
  },

  onSongEnd: () => {
    const { repeat, queue, queueIndex } = get();
    if (repeat === 'one') {
      const { audioRef } = get();
      if (audioRef) { audioRef.currentTime = 0; audioRef.play().catch(() => {}); }
    } else get().nextSong();
  },
}));

export default usePlayerStore;
