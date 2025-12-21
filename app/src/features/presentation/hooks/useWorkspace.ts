import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useFetchStreamingOutline from '@/features/presentation/hooks/useFetchStreaming';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import { useDraftPresentation } from './useApi';
import type { PresentationGenerateDraftRequest } from '../types';
import usePresentationStore from '../stores/usePresentationStore';

interface UseWorkspaceProps {}

export const useWorkspace = ({}: UseWorkspaceProps) => {
  const navigate = useNavigate();

  // Form context
  const formHook = usePresentationForm();
  const { getValues, trigger, setValue } = formHook;

  // Stores
  const setOutlines = useOutlineStore((state) => state.setOutlines);
  const startStream = useOutlineStore((state) => state.startStreaming);
  const endStream = useOutlineStore((state) => state.endStreaming);
  const markdownContent = useOutlineStore((state) => state.markdownContent);
  const clearOutline = useOutlineStore((state) => state.clearOutline);
  const isStreamingStore = useOutlineStore((state) => state.isStreaming);
  const isGeneratingOutline = useOutlineStore((state) => state.isGenerating);
  const draftPresentation = useDraftPresentation();

  // Streaming API
  const {
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
    setOutlines,
    { manual: true }
  );

  const { setRequest } = usePresentationStore();

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
      'artStyle',
      'imageModel',
      'model',
      'slideCount',
      'language',
    ]);
    if (!isValid) return;

    const outline = markdownContent();
    const data = getValues();

    const generationRequest: PresentationGenerateDraftRequest = {
      presentation: {
        // Ensure we supply a valid theme (fall back to an empty object cast if not set)
        theme: (data.theme as any) || ({} as any),
        viewport: { width: 1000, height: 562.5 },
      },
    };
    try {
      const result = await draftPresentation.mutateAsync(generationRequest);
      setRequest({
        ...generationRequest,

        outline,
        model: data.model,
        slideCount: data.slideCount,
        language: data.language,

        generationOptions: {
          // Default artStyle to empty string (allowed option) if not set
          artStyle: data.artStyle?.value ?? '',
          artStyleModifiers: data.artStyle?.modifiers,
          imageModel: data.imageModel ?? { name: '', provider: '' },
        },
      });
      clearOutline();
      setValue('topic', '');

      // Navigate to the detail page
      navigate(`/presentation/${result.id}?isGenerating=true`, { replace: true });
    } catch {
      toast.error('Error generating presentation. Please try again.');
    }
  }, [trigger, markdownContent, getValues, navigate]);

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

  return {
    isStreaming: isStreamingStore,
    stopStream,
    clearContent,

    // Form handlers
    handleRegenerateOutline,
    handleGeneratePresentation,

    // Only return needed form properties
    control: formHook.control,
    watch: formHook.watch,
    setValue: formHook.setValue,
    getValues: formHook.getValues,
  };
};
