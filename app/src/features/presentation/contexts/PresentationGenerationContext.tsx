import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback } from 'react';
import type {
  PresentationGenerationRequest,
  PresentationGenerationStartResponse,
} from '@/features/presentation/types';
import { useFetchStreamingPresentation } from '@/features/presentation/hooks/useFetchStreaming';
import usePresentationStore from '@/features/presentation/stores/usePresentationStore';
import { toast } from 'sonner';
import '../components/remote/module';

interface PresentationGenerationContextValue {
  startGeneration: (request: PresentationGenerationRequest) => Promise<PresentationGenerationStartResponse>;
  getRequest: () => PresentationGenerationRequest;
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
  const clearStreamedData = usePresentationStore((state) => state.clearStreamedData);
  const clearGeneratedPresentation = usePresentationStore((state) => state.clearGeneratedPresentation);

  const { isStreaming, error, result, fetch } = useFetchStreamingPresentation(
    request || ({} as PresentationGenerationRequest),
    setStreamedData
  );

  const resultRef = useRef(result);

  // Keep ref updated
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const startGeneration = useCallback(
    async (newRequest: PresentationGenerationRequest) => {
      clearGeneratedPresentation();
      clearStreamedData();
      setRequest(newRequest);

      // Start the streaming process
      fetch(newRequest);

      let attempts = 0;
      const maxAttempts = 50;

      while (!resultRef.current && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      return resultRef.current || { presentationId: '' };
    },
    [fetch]
  );

  useEffect(() => {
    if (error) {
      toast.error('Error generating presentation. Please try again.');
    }
  }, [error]);

  // Sync all state with store
  useEffect(() => {
    setIsGenerating(isStreaming);
  }, [isStreaming, setIsGenerating]);

  const contextValue: PresentationGenerationContextValue = {
    startGeneration,
    getRequest: () => request as PresentationGenerationRequest,
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
