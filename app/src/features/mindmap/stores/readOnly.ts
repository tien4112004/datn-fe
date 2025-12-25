import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ReadOnlyState {
  isReadOnly: boolean;
  setReadOnly: (isReadOnly: boolean) => void;
}

export const useReadOnlyStore = create<ReadOnlyState>()(
  devtools(
    (set) => ({
      isReadOnly: false,
      setReadOnly: (isReadOnly: boolean) => set({ isReadOnly }, false, 'mindmap-readonly/setReadOnly'),
    }),
    { name: 'ReadOnlyStore' }
  )
);
