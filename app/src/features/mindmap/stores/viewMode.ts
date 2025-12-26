import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ViewModeState {
  isViewMode: boolean;
  setViewMode: (isViewMode: boolean) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  devtools(
    (set) => ({
      isViewMode: false,
      setViewMode: (isViewMode: boolean) => set({ isViewMode }, false, 'mindmap-viewMode/setViewMode'),
    }),
    { name: 'ViewModeStore' }
  )
);
