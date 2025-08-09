import { create } from 'zustand';
import type { OutlineItem } from '@/features/presentation/types';

interface OutlineStore {
  content: OutlineItem[];
  setContent: (value: OutlineItem[]) => void;
  isStreaming?: boolean;
  streamingContent?: string;
  setStreamingContent?: (value: string) => void;
  endStreaming?: () => void;
  handleContentChange?: (id: string, content: string) => void;
}

const useOutlineStore = create<OutlineStore>((set) => ({
  content: [],
  isStreaming: false,
  streamingContent: '',

  setContent: (value) => set({ content: value }),
  setStreamingContent: (value) => set({ isStreaming: true, streamingContent: value }),
  endStreaming: () => set({ isStreaming: false, streamingContent: '' }),
  handleContentChange: (id, content) =>
    set((state) => ({
      content: state.content.map((item) => (item.id === id ? { ...item, htmlContent: content } : item)),
    })),
}));

export default useOutlineStore;
