import { create } from 'zustand';
import type { OutlineItem } from '@/features/presentation/types';
import { arrayMove } from '@dnd-kit/sortable';
import { mapOutlineItemsToMarkdown } from '@/features/presentation/utils';

interface OutlineStore {
  content: OutlineItem[];
  contentIds: string[];
  isStreaming?: boolean;
  markdownContent: () => string;
  setContent: (value: OutlineItem[]) => void;
  startStreaming: () => void;
  endStreaming: () => void;
  handleContentChange?: (id: string, content: string) => void;
  deleteContent: (id: string) => void;
  addContent: (item: OutlineItem) => void;
  getContent: (id: string) => OutlineItem | undefined;
  swap: (oldId: string, newId: string) => void;
}

const useOutlineStore = create<OutlineStore>((set, get) => ({
  content: [],
  contentIds: [],
  isStreaming: false,

  markdownContent: () => {
    return mapOutlineItemsToMarkdown(get().content);
  },

  setContent: (value) => {
    set({ content: value });
    set({ contentIds: value.map((item) => item.id) });
  },

  handleContentChange: (id, content) =>
    set((state) => ({
      content: state.content.map((item) => (item.id === id ? { ...item, markdownContent: content } : item)),
    })),

  deleteContent: (id) =>
    set((state) => ({
      content: state.content.filter((item) => item.id !== id),
    })),

  swap: (oldId: string, newId: string) => {
    const { content } = get();
    const oldIndex = content.findIndex((item) => item.id === oldId);
    const newIndex = content.findIndex((item) => item.id === newId);
    set((state) => ({
      content: arrayMove(state.content, oldIndex, newIndex),
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

  addContent: (item) =>
    set((state) => ({
      content: [...state.content, item],
      contentIds: [...state.contentIds, item.id],
    })),

  getContent: (id) => get().content.find((item) => item.id === id),
}));

export default useOutlineStore;
