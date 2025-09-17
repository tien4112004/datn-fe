import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OutlineItem } from '@/features/presentation/types';
import { arrayMove } from '@dnd-kit/sortable';
import { mapOutlineItemsToMarkdown } from '@/features/presentation/utils';

interface OutlineStore {
  outlines: OutlineItem[];
  outlineIds: string[];
  isStreaming: boolean;
  markdownContent: () => string;
  setOutlines: (value: OutlineItem[]) => void;
  startStreaming: () => void;
  endStreaming: () => void;
  handleOutlineChange?: (id: string, content: string) => void;
  deleteOutline: (id: string) => void;
  addOutline: (item: OutlineItem) => void;
  getOutline: (id: string) => OutlineItem | undefined;
  swap: (oldId: string, newId: string) => void;
  clearOutline: () => void;
  isEmpty: () => boolean;
}

const useOutlineStore = create<OutlineStore>()(
  persist(
    (set, get) => ({
      outlines: [],
      outlineIds: [],
      isStreaming: false,

      markdownContent: () => {
        return mapOutlineItemsToMarkdown(get().outlines);
      },

      setOutlines: (value) => {
        const prev = get().outlines;
        if (value.length !== prev.length) {
          set({ outlineIds: value.map((item) => item.id) });
        }
        set({ outlines: value });
      },

      handleOutlineChange: (id, content) =>
        set((state) => ({
          outlines: state.outlines.map((item) =>
            item.id === id ? { ...item, markdownContent: content } : item
          ),
        })),

      deleteOutline: (id) => {
        set((state) => ({
          outlines: state.outlines.filter((item) => item.id !== id),
          outlineIds: state.outlineIds.filter((itemId) => itemId !== id),
        }));
      },

      swap: (oldId: string, newId: string) => {
        const { outlines: content } = get();
        const oldIndex = content.findIndex((item) => item.id === oldId);
        const newIndex = content.findIndex((item) => item.id === newId);
        set((state) => ({
          outlines: arrayMove(state.outlines, oldIndex, newIndex),
        }));
      },

      startStreaming: () =>
        set(() => ({
          isStreaming: true,
        })),

      endStreaming: () => {
        set(() => ({
          isStreaming: false,
        }));
      },

      addOutline: (item) =>
        set((state) => ({
          outlines: [...state.outlines, item],
          outlineIds: [...state.outlineIds, item.id],
        })),

      getOutline: (id) => get().outlines.find((item) => item.id === id),

      clearOutline: () =>
        set(() => ({
          outlines: [],
          outlineIds: [],
        })),

      isEmpty: () => {
        const { outlines, outlineIds, isStreaming } = get();
        return outlines.length === 0 && outlineIds.length === 0 && !isStreaming;
      },
    }),
    {
      name: 'outline-store',
      partialize: (state) => ({
        outlines: state.outlines,
        outlineIds: state.outlineIds,
      }),
    }
  )
);

export default useOutlineStore;
