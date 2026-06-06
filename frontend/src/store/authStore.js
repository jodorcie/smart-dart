import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const useAuthStore = create(
  persist(
    (set) => ({
      isOperator: false,
      loginError: '',
      loginLoading: false,

      login: async (username, password) => {
        set({ loginLoading: true, loginError: '' });
        try {
          const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();
          if (res.ok && data.ok) {
            set({ isOperator: true, loginError: '', loginLoading: false });
            return true;
          }
          set({ loginError: data.message || 'Login failed.', loginLoading: false });
          return false;
        } catch {
          set({ loginError: 'Cannot reach server. Check your connection.', loginLoading: false });
          return false;
        }
      },

      logout: () => set({ isOperator: false, loginError: '' }),
      clearError: () => set({ loginError: '' }),
    }),
    { name: 'dart-auth' }
  )
);

export default useAuthStore;
