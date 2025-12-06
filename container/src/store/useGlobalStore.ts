import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalState {
  isSidebarOpen: boolean;
  setSidebarState: (open: boolean) => void;
}

const STORAGE_KEY = 'global-state';

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,

      setSidebarState: (open: boolean) =>
        set({
          isSidebarOpen: open,
        }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
