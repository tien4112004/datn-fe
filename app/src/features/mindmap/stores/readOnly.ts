import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PresenterModeState {
  // Primary flag
  isPresenterMode: boolean;
  // Backwards-compatible alias
  isReadOnly: boolean;
  setPresenterMode: (isPresenterMode: boolean) => void;
  setReadOnly: (isReadOnly: boolean) => void;
}

export const usePresenterModeStore = create<PresenterModeState>()(
  devtools(
    (set) => ({
      isPresenterMode: false,
      isReadOnly: false,
      setPresenterMode: (isPresenterMode: boolean) =>
        set(
          { isPresenterMode, isReadOnly: isPresenterMode },
          false,
          'mindmap-presenter-mode/setPresenterMode'
        ),
      setReadOnly: (isReadOnly: boolean) =>
        set({ isReadOnly, isPresenterMode: isReadOnly }, false, 'mindmap-presenter-mode/setReadOnly'),
    }),
    { name: 'PresenterModeStore' }
  )
);

// Backwards-compatible export names
export const useReadOnlyStore = usePresenterModeStore; // alias
