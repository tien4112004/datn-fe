import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGeneratePresentation } from '@/features/presentation/hooks/useApi';
import useFetchStreamingOutline from '@/features/presentation/hooks/useFetchStreaming';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import usePresentationStore from '@/features/presentation/stores/usePresentationStore';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';

interface UseWorkspaceProps {}

export const useWorkspace = ({}: UseWorkspaceProps) => {
  const navigate = useNavigate();

  // Form context
  const { trigger, getValues } = usePresentationForm();

  // Streaming API
  const {
    processedData: outlineItems,
    isStreaming,
    error,
    stopStream,
    restartStream,
    clearContent,
  } = useFetchStreamingOutline({
    topic: getValues().topic,
    slideCount: getValues().slideCount,
    language: getValues().language,
    model: getValues().model,
    targetAge: getValues().targetAge,
    learningObjective: getValues().learningObjective,
  });

  // Stores
  const setOutlines = useOutlineStore((state) => state.setOutlines);
  const startStream = useOutlineStore((state) => state.startStreaming);
  const endStream = useOutlineStore((state) => state.endStreaming);
  const markdownContent = useOutlineStore((state) => state.markdownContent);
  const clearOutline = useOutlineStore((state) => state.clearOutline);

  const generatePresentationMutation = useGeneratePresentation();
  const setGeneratedPresentation = usePresentationStore((state) => state.setGeneratedPresentation);
  const setIsGenerating = usePresentationStore((state) => state.setIsGenerating);
  const isGenerating = usePresentationStore((state) => state.isGenerating);

  // Handle streaming errors
  if (error) {
    toast.error('Error generating outline. Please try again.');
  }

  // Form handlers
  const handleRegenerateOutline = useCallback(async () => {
    const isValid = await trigger([
      'topic',
      'slideCount',
      'language',
      'model',
      'targetAge',
      'learningObjective',
    ]);
    if (!isValid) return;

    const data = getValues();
    const outlineData = {
      topic: data.topic,
      slideCount: data.slideCount,
      language: data.language,
      model: data.model,
      targetAge: data.targetAge,
      learningObjective: data.learningObjective,
    };
    restartStream(outlineData);
  }, []);

  const handleGeneratePresentation = useCallback(async () => {
    const isValid = await trigger([
      'theme',
      'contentLength',
      'imageModel',
      'slideCount',
      'targetAge',
      'learningObjective',
      'model',
      'language',
    ]);
    if (!isValid) return;

    try {
      setIsGenerating(true);
      const outline = markdownContent();
      const data = getValues();

      const generationRequest = {
        outline,
        theme: data.theme,
        contentLength: data.contentLength,
        imageModel: data.imageModel,
        slideCount: data.slideCount,
        language: data.language,
        model: data.model,
        targetAge: data.targetAge,
        learningObjective: data.learningObjective,
      };

      const generatedPresentation = await generatePresentationMutation.mutateAsync(generationRequest);

      setGeneratedPresentation(generatedPresentation);

      // Clear outline store and form data
      clearOutline();

      navigate(`/presentation/${generatedPresentation.presentation.id}`);
    } catch (error) {
      console.error('Error generating presentation:', error);
      toast.error('Failed to generate presentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Sync streaming state with store
  useEffect(() => {
    if (isStreaming) {
      startStream();
      setOutlines([...outlineItems]);
    } else {
      endStream();
    }
  }, [isStreaming, outlineItems, startStream, setOutlines, endStream]);

  return {
    stopStream,
    clearContent,

    // Form handlers
    handleRegenerateOutline,
    handleGeneratePresentation,
    isGenerating,
  };
};
