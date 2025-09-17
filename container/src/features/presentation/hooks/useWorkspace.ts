import { useEffect } from 'react';
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
  const { trigger, getValues, watch } = usePresentationForm();

  // Get current form data for streaming
  const formData = watch();

  // Streaming API
  const {
    processedData: outlineItems,
    isStreaming,
    error,
    stopStream,
    restartStream,
    clearContent,
  } = useFetchStreamingOutline({
    topic: formData.topic,
    slideCount: formData.slideCount,
    language: formData.language,
    model: formData.model,
    targetAge: formData.targetAge,
    learningObjective: formData.learningObjective,
  });

  // Stores
  const setContent = useOutlineStore((state) => state.setOutlines);
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
  const handleRegenerateOutline = async () => {
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
  };

  const handleGeneratePresentation = async () => {
    const isValid = await trigger(['theme', 'contentLength', 'imageModel']);
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
  };

  // Sync streaming state with store
  useEffect(() => {
    if (isStreaming) {
      startStream();
      setContent([...outlineItems]);
    } else {
      endStream();
    }
  }, [isStreaming, outlineItems, startStream, setContent, endStream]);

  return {
    // Streaming state
    isStreaming,
    stopStream,
    clearContent,

    // Form handlers
    handleRegenerateOutline,
    handleGeneratePresentation,
    isGenerating,
  };
};
