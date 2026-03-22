import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({ user: res.data.user, isAuthenticated: true });
    return res.data;
  },

  signup: async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    set({ user: res.data.user, isAuthenticated: true });
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
}));

export default useAuthStore;
