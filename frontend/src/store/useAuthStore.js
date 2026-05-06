import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      
      setAuth: (user, token) => set({ user, token, isLoggedIn: true }),
      
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, isLoggedIn: false });
      },
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
