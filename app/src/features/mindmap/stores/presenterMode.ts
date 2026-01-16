import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PresenterModeState {
  isPresenterMode: boolean;
  setPresenterMode: (isPresenterMode: boolean) => void;
}

export const usePresenterModeStore = create<PresenterModeState>()(
  devtools(
    (set) => ({
      isPresenterMode: false,
      setPresenterMode: (isPresenterMode: boolean) =>
        set({ isPresenterMode }, false, 'mindmap-presenter-mode/setPresenterMode'),
    }),
    { name: 'PresenterModeStore' }
  )
);
