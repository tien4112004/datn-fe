import { create } from 'zustand';
import { GenerateMatrixRequest } from '@/features/assignment/types/assignment';

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  request: GenerateMatrixRequest;
  resultSummary: {
    topicCount: number;
    totalQuestions: number;
    totalPoints: number;
  };
}

interface GenerationHistoryStore {
  history: GenerationHistoryItem[];
  addHistoryItem: (item: Omit<GenerationHistoryItem, 'id' | 'timestamp'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  getHistoryItem: (id: string) => GenerationHistoryItem | undefined;
  loadHistory: () => void;
}

const STORAGE_KEY = 'matrix_generation_history';
const MAX_HISTORY_ITEMS = 5;

export const useGenerationHistoryStore = create<GenerationHistoryStore>((set, get) => ({
  history: [],

  loadHistory: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        set({ history });
      }
    } catch (error) {
      console.error('Failed to load generation history:', error);
    }
  },

  addHistoryItem: (item) => {
    try {
      const newItem: GenerationHistoryItem = {
        ...item,
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
      };

      set((state) => {
        // Add new item and keep only the last MAX_HISTORY_ITEMS
        const updated = [newItem, ...state.history].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { history: updated };
      });
    } catch (error) {
      console.error('Failed to add history item:', error);
    }
  },

  removeHistoryItem: (id: string) => {
    try {
      set((state) => {
        const updated = state.history.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { history: updated };
      });
    } catch (error) {
      console.error('Failed to remove history item:', error);
    }
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      set({ history: [] });
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },

  getHistoryItem: (id: string) => {
    const { history } = get();
    return history.find((item) => item.id === id);
  },
}));

// Load history on store initialization
useGenerationHistoryStore.getState().loadHistory();
