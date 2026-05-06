import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: { name: 'Demo Student', email: 'demo@example.com' },
      token: 'demo-token',
      isLoggedIn: true,
      
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
