import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DirtyState {
  isDirty: boolean;
  markDirty: () => void;
  markSaved: () => void;
  reset: () => void;
}

export const useDirtyStore = create<DirtyState>()(
  devtools(
    (set) => ({
      isDirty: false,

      markDirty: () => {
        set({ isDirty: true }, false, 'mindmap-dirty/markDirty');
        // Dispatch custom event for other listeners
        window.dispatchEvent(
          new CustomEvent('app.mindmap.dirty-state-changed', {
            detail: { isDirty: true },
          })
        );
      },

      markSaved: () => {
        set({ isDirty: false }, false, 'mindmap-dirty/markSaved');
        // Dispatch custom event for other listeners
        window.dispatchEvent(
          new CustomEvent('app.mindmap.dirty-state-changed', {
            detail: { isDirty: false },
          })
        );
      },

      reset: () => {
        set({ isDirty: false }, false, 'mindmap-dirty/reset');
        // Dispatch custom event for other listeners
        window.dispatchEvent(
          new CustomEvent('app.mindmap.dirty-state-changed', {
            detail: { isDirty: false },
          })
        );
      },
    }),
    {
      name: 'mindmap-dirty-store',
    }
  )
);
