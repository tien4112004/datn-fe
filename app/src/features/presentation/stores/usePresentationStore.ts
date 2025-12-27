import { create } from 'zustand';
import type { PresentationGenerationRequest } from '@/features/presentation/types';

interface PresentationStore {
  request: PresentationGenerationRequest | null;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  setRequest: (request: PresentationGenerationRequest) => void;
}

const usePresentationStore = create<PresentationStore>((set) => ({
  request: null,
  isGenerating: false,

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  setRequest: (request) => {
    set({ request });
  },
}));

export default usePresentationStore;
