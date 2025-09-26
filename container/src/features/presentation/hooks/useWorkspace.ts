import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useFetchStreamingOutline from '@/features/presentation/hooks/useFetchStreaming';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';

interface UseWorkspaceProps {}

export const useWorkspace = ({}: UseWorkspaceProps) => {
  const navigate = useNavigate();

  // Form context
  const formHook = usePresentationForm();
  const { getValues, trigger, setValue } = formHook;

  // Streaming API
  const {
    processedData: outlineItems,
    isStreaming,
    error,
    stopStream: stopStreamOutline,
    restartStream,
    clearContent: clearOutlineContent,
    fetch,
  } = useFetchStreamingOutline(
    {
      topic: getValues().topic,
      slideCount: getValues().slideCount,
      language: getValues().language,
      model: getValues().model,
    },
    { manual: true }
  );

  // Stores
  const setOutlines = useOutlineStore((state) => state.setOutlines);
  const startStream = useOutlineStore((state) => state.startStreaming);
  const endStream = useOutlineStore((state) => state.endStreaming);
  const markdownContent = useOutlineStore((state) => state.markdownContent);
  const clearOutline = useOutlineStore((state) => state.clearOutline);
  const isStreamingStore = useOutlineStore((state) => state.isStreaming);
  const isGeneratingOutline = useOutlineStore((state) => state.isGenerating);

  const { isStreaming: isGenerating, startGeneration } = usePresentationGeneration();

  useEffect(() => {
    if (isGeneratingOutline) fetch();
  }, [isGeneratingOutline, fetch]);

  // Handle streaming errors
  useEffect(() => {
    if (error) {
      toast.error('Error generating outline. Please try again.');
    }
  }, [error]);

  // Form handlers
  const handleRegenerateOutline = useCallback(async () => {
    const isValid = await trigger(['topic', 'slideCount', 'language', 'model']);
    if (!isValid) return;

    const data = getValues();
    const outlineData = {
      topic: data.topic,
      slideCount: data.slideCount,
      language: data.language,
      model: data.model,
    };
    restartStream(outlineData);
  }, []);

  const handleGeneratePresentation = useCallback(async () => {
    const isValid = await trigger([
      'theme',
      'contentLength',
      'imageModel',
      'model',
      'slideCount',
      'language',
    ]);
    if (!isValid) return;

    const outline = markdownContent();
    const data = getValues();

    const generationRequest = {
      outline,
      theme: data.theme,
      contentLength: data.contentLength,
      imageModel: data.imageModel,
      model: data.model,
      slideCount: data.slideCount,
      language: data.language,
    };

    const result = await startGeneration(generationRequest);

    navigate(`/presentation/${result.presentationId}?isGenerating=true`);
    setValue('topic', '');
    clearOutline();
  }, [trigger, markdownContent, getValues, startGeneration]);

  const stopStream = useCallback(() => {
    stopStreamOutline();
    endStream();
  }, [stopStreamOutline, endStream]);

  const clearContent = useCallback(() => {
    clearOutlineContent();
    clearOutline();
  }, [clearOutlineContent, clearOutline]);

  // Sync streaming state with store
  useEffect(() => {
    if (isStreaming) {
      startStream();
    } else {
      endStream();
    }
  }, [isStreaming, startStream, endStream]);

  // Only update outlines when streaming produces new data
  useEffect(() => {
    if (isStreaming && outlineItems.length > 0) {
      setOutlines([...outlineItems]);
    }
  }, [isStreaming, outlineItems, setOutlines]);

  return {
    isStreaming: isStreamingStore,
    stopStream,
    clearContent,

    // Form handlers
    handleRegenerateOutline,
    handleGeneratePresentation,
    isGenerating,

    ...formHook,
  };
};
