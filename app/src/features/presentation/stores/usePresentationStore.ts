import { create } from 'zustand';
import type {
  AiResultSlide,
  PresentationGenerationRequest,
  PresentationGenerationResponse,
} from '@/features/presentation/types';

interface PresentationStore {
  request: PresentationGenerationRequest | null;
  generatedPresentation: PresentationGenerationResponse | null;
  streamedData: AiResultSlide[];
  isGenerating: boolean;
  setGeneratedPresentation: (presentation: PresentationGenerationResponse) => void;
  setStreamedData: (data: AiResultSlide[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearGeneratedPresentation: () => void;
  clearStreamedData: () => void;
  setRequest: (request: PresentationGenerationRequest) => void;
}

const usePresentationStore = create<PresentationStore>((set) => ({
  request: null,
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

  setRequest: (request) => {
    set({ request });
  },
}));

export default usePresentationStore;
