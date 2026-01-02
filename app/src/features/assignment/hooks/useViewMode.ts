import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { VIEW_MODE, type ViewMode } from '../types';

export interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  devtools(
    (set) => ({
      viewMode: VIEW_MODE.EDITING,
      setViewMode: (viewMode: ViewMode) => set({ viewMode }, false, 'assignment-viewMode/setViewMode'),
    }),
    { name: 'AssignmentViewModeStore' }
  )
);
