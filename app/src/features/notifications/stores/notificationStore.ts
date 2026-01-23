import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  fcmToken: string | null;
  isRegistered: boolean;
  hasRequestedPermission: boolean;

  setFcmToken: (token: string | null) => void;
  setIsRegistered: (registered: boolean) => void;
  setHasRequestedPermission: (requested: boolean) => void;
  reset: () => void;
}

const initialState = {
  fcmToken: null,
  isRegistered: false,
  hasRequestedPermission: false,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      ...initialState,

      setFcmToken: (token) => set({ fcmToken: token }),
      setIsRegistered: (registered) => set({ isRegistered: registered }),
      setHasRequestedPermission: (requested) => set({ hasRequestedPermission: requested }),
      reset: () => set(initialState),
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        hasRequestedPermission: state.hasRequestedPermission,
      }),
    }
  )
);
