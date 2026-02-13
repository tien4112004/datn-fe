import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalState {
  isSidebarOpen: boolean;
  setSidebarState: (open: boolean) => void;
  lastResourceTab: string;
  setLastResourceTab: (tab: string) => void;
}

const STORAGE_KEY = 'global-state';

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      lastResourceTab: 'presentation',

      setSidebarState: (open: boolean) =>
        set({
          isSidebarOpen: open,
        }),

      setLastResourceTab: (tab: string) =>
        set({
          lastResourceTab: tab,
        }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
