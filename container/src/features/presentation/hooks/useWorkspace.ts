import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useFormPersist from 'react-hook-form-persist';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGeneratePresentation } from '@/features/presentation/hooks/useApi';
import useFetchStreamingOutline from '@/features/presentation/hooks/useFetchStreaming';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import usePresentationStore from '@/features/presentation/stores/usePresentationStore';
import type { OutlineData } from '@/features/presentation/types/outline';

type UnifiedFormData = {
  // Outline fields
  topic: string;
  slideCount: number;
  language: string;
  model: string;
  targetAge: string;
  learningObjective: string;
  // Customization fields
  theme: string;
  contentLength: string;
  imageModel: string;
};

interface UseWorkspaceProps {
  initialOutlineData: OutlineData;
}

export const useWorkspace = ({ initialOutlineData }: UseWorkspaceProps) => {
  const navigate = useNavigate();

  // Streaming API
  const {
    processedData: outlineItems,
    isStreaming,
    error,
    stopStream,
    restartStream,
    clearContent,
  } = useFetchStreamingOutline(initialOutlineData);

  // Stores
  const setContent = useOutlineStore((state) => state.setContent);
  const startStream = useOutlineStore((state) => state.startStreaming);
  const endStream = useOutlineStore((state) => state.endStreaming);
  const markdownContent = useOutlineStore((state) => state.markdownContent);

  const generatePresentationMutation = useGeneratePresentation();
  const setGeneratedPresentation = usePresentationStore((state) => state.setGeneratedPresentation);
  const setIsGenerating = usePresentationStore((state) => state.setIsGenerating);
  const isGenerating = usePresentationStore((state) => state.isGenerating);

  // Form management with persistence
  const { control, watch, setValue, trigger, getValues, reset } = useForm<UnifiedFormData>({
    defaultValues: {
      ...initialOutlineData,
      theme: '',
      contentLength: '',
      imageModel: '',
    },
  });

  // Persist unified form data
  useFormPersist('presentation-unified-form', {
    watch,
    setValue,
    storage: window.localStorage,
    exclude: [],
  });

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
    console.log('Regenerating outline with data:', outlineData);
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

      navigate(`/presentation/${generatedPresentation.presentation.id}`);
    } catch (error) {
      console.error('Error generating presentation:', error);
      setIsGenerating(false);
      toast.error('Failed to generate presentation. Please try again.');
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

    // Form controls
    control,
    watch,
    setValue,
    handleRegenerateOutline,
    handleGeneratePresentation,
    isGenerating,
  };
};

export type { UnifiedFormData };
