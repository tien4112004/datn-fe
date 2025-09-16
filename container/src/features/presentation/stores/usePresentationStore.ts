import { create } from 'zustand';
import type { PresentationGenerationResponse } from '@/features/presentation/types';

interface PresentationStore {
  generatedPresentation: PresentationGenerationResponse | null;
  isGenerating: boolean;
  setGeneratedPresentation: (presentation: PresentationGenerationResponse) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearGeneratedPresentation: () => void;
}

const usePresentationStore = create<PresentationStore>((set) => ({
  generatedPresentation: null,
  isGenerating: false,

  setGeneratedPresentation: (presentation) => {
    set({ generatedPresentation: presentation, isGenerating: false });
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  clearGeneratedPresentation: () => {
    set({ generatedPresentation: null });
  },
}));

export default usePresentationStore;
