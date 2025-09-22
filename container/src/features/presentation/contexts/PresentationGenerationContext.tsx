import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PresentationGenerationRequest } from '@/features/presentation/types';
import { useFetchStreamingPresentation } from '@/features/presentation/hooks/useFetchStreaming';
import usePresentationStore from '@/features/presentation/stores/usePresentationStore';

interface PresentationGenerationContextValue {
  startGeneration: (request: PresentationGenerationRequest) => void;
  error: string | null;
}

const PresentationGenerationContext = createContext<PresentationGenerationContextValue | null>(null);

interface PresentationGenerationProviderProps {
  children: ReactNode;
}

/**
 * The context is only used to keep the streamed data alive (not lost on route change)
 */
export const PresentationGenerationProvider = ({ children }: PresentationGenerationProviderProps) => {
  const [request, setRequest] = useState<PresentationGenerationRequest | null>(null);

  // Zustand store actions
  const setIsGenerating = usePresentationStore((state) => state.setIsGenerating);
  const setStreamedData = usePresentationStore((state) => state.setStreamedData);

  const {
    processedData: streamedData,
    isStreaming,
    error,
    restartStream,
  } = useFetchStreamingPresentation(request || ({} as PresentationGenerationRequest));

  // Sync all state with store
  useEffect(() => {
    setIsGenerating(isStreaming);
  }, [isStreaming, setIsGenerating]);

  useEffect(() => {
    setStreamedData(streamedData || []);
  }, [streamedData, setStreamedData]);

  const startGeneration = (newRequest: PresentationGenerationRequest) => {
    setRequest(newRequest);
    if (request) {
      restartStream(newRequest);
    }
  };

  const contextValue: PresentationGenerationContextValue = {
    startGeneration,
    error,
  };

  return (
    <PresentationGenerationContext.Provider value={contextValue}>
      {children}
    </PresentationGenerationContext.Provider>
  );
};

export const usePresentationGeneration = () => {
  const context = useContext(PresentationGenerationContext);
  if (!context) {
    throw new Error('usePresentationGeneration must be used within a PresentationGenerationProvider');
  }

  // Get data from store (single source of truth)
  const streamedData = usePresentationStore((state) => state.streamedData);
  const isStreaming = usePresentationStore((state) => state.isGenerating);

  return {
    ...context,
    streamedData,
    isStreaming,
  };
};
