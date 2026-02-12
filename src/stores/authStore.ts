import { create } from 'zustand';
import { User } from '@/types';
import { getCurrentUser, setCurrentUser, loginUser as loginUserStorage } from '@/lib/storage';

interface AuthStore {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  refreshUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: getCurrentUser(),
  isLoggedIn: !!getCurrentUser(),
  
  login: (email: string, password: string) => {
    const user = loginUserStorage(email, password);
    if (user) {
      set({ currentUser: user, isLoggedIn: true });
      return true;
    }
    return false;
  },
  
  logout: () => {
    setCurrentUser(null);
    set({ currentUser: null, isLoggedIn: false });
  },
  
  refreshUser: () => {
    const user = getCurrentUser();
    set({ currentUser: user, isLoggedIn: !!user });
  },
}));
