import { create } from 'zustand';
import type { OutlineItem } from '@/features/presentation/types';

interface OutlineStore {
  content: OutlineItem[];
  setContent: (value: OutlineItem[]) => void;
  endStreaming?: () => void;
  handleContentChange?: (id: string, content: string) => void;
}

const useOutlineStore = create<OutlineStore>((set) => ({
  content: [],

  setContent: (value) => {
    set({ content: value });
  },
  handleContentChange: (id, content) =>
    set((state) => ({
      // content: state.content.map((item) => (item.id === id ? { ...item, htmlContent: content } : item)),
      content: state.content.map((item) => (item.id === id ? { ...item, markdownContent: content } : item)),
    })),
}));

export default useOutlineStore;
