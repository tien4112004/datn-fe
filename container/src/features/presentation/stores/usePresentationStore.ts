import { create } from 'zustand';
import type { AiResultSlide, PresentationGenerationResponse } from '@/features/presentation/types';

interface PresentationStore {
  generatedPresentation: PresentationGenerationResponse | null;
  streamedData: AiResultSlide[];
  isGenerating: boolean;
  setGeneratedPresentation: (presentation: PresentationGenerationResponse) => void;
  setStreamedData: (data: AiResultSlide[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearGeneratedPresentation: () => void;
  clearStreamedData: () => void;
}

const usePresentationStore = create<PresentationStore>((set) => ({
  generatedPresentation: null,
  streamedData: [],
  isGenerating: false,

  setGeneratedPresentation: (presentation) => {
    set({ generatedPresentation: presentation, isGenerating: false });
  },

  setStreamedData: (data) => {
    set({ streamedData: data });
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  clearGeneratedPresentation: () => {
    set({ generatedPresentation: null });
  },

  clearStreamedData: () => {
    set({ streamedData: [] });
  },
}));

export default usePresentationStore;
