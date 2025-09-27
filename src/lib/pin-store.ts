import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PinStore {
  // PIN for accessing Shift Management and Settings
  adminPin: string;
  
  // Actions
  setAdminPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  
  // PIN session management
  isAuthenticated: boolean;
  lastAuthTime: number | null;
  authDuration: number; // in milliseconds (default: 30 minutes)
  
  authenticate: (pin: string) => boolean;
  logout: () => void;
  isSessionValid: () => boolean;
  extendSession: () => void;
}

export const usePinStore = create<PinStore>()(
  persist(
    (set, get) => ({
      adminPin: '123456', // Default PIN - should be changed on first use
      isAuthenticated: false,
      lastAuthTime: null,
      authDuration: 30 * 60 * 1000, // 30 minutes
      
      setAdminPin: (pin: string) => {
        set({ adminPin: pin });
      },
      
      verifyPin: (pin: string) => {
        return get().adminPin === pin;
      },
      
      authenticate: (pin: string) => {
        const { verifyPin } = get();
        if (verifyPin(pin)) {
          set({ 
            isAuthenticated: true, 
            lastAuthTime: Date.now() 
          });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false, 
          lastAuthTime: null 
        });
      },
      
      isSessionValid: () => {
        const { isAuthenticated, lastAuthTime, authDuration } = get();
        if (!isAuthenticated || !lastAuthTime) {
          return false;
        }
        
        const currentTime = Date.now();
        const isValid = (currentTime - lastAuthTime) < authDuration;
        
        if (!isValid) {
          get().logout();
        }
        
        return isValid;
      },
      
      extendSession: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          set({ lastAuthTime: Date.now() });
        }
      },
    }),
    {
      name: 'qr-tunai-pin-storage',
      partialize: (state) => ({
        adminPin: state.adminPin,
        // Don't persist authentication state for security
      }),
    }
  )
);