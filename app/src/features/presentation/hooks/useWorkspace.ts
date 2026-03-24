import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useFetchStreamingOutline from '@/features/presentation/hooks/useFetchStreaming';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import { useDraftPresentation } from './useApi';
import type { PresentationGenerateDraftRequest } from '../types';
import usePresentationStore from '../stores/usePresentationStore';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';

interface UseWorkspaceProps {}

export const useWorkspace = ({}: UseWorkspaceProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.PRESENTATION);

  // Form context
  const formHook = usePresentationForm();
  const { getValues, trigger, setValue, attachedFiles } = formHook;

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
      topic: getValues().topic || undefined,
      fileUrls: attachedFiles.map((f) => f.url),
      slideCount: getValues().slideCount,
      language: getValues().language,
      model: getValues().model,
      grade: getValues().grade || undefined,
      subject: getValues().subject || undefined,
      chapter: getValues().chapter || undefined,
    },
    setOutlines,
    { manual: true }
  );

  const { setRequest } = usePresentationStore();

  useEffect(() => {
    if (isGeneratingOutline) fetch();
  }, [isGeneratingOutline, fetch]);

  // Handle streaming errors - error is displayed inline in OutlineWorkspace
  useEffect(() => {
    if (error) {
      endStream();
    }
  }, [error, endStream]);

  // Form handlers
  const handleRegenerateOutline = useCallback(async () => {
    const data = getValues();
    const hasTopic = data.topic?.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    if (!hasTopic && !hasFiles) return;

    const isValid = await trigger(['slideCount', 'language', 'model']);
    if (!isValid) return;

    const outlineData = {
      topic: data.topic || undefined,
      fileUrls: attachedFiles.map((f) => f.url),
      slideCount: data.slideCount,
      language: data.language,
      model: data.model,
      grade: data.grade || undefined,
      subject: data.subject || undefined,
      chapter: data.chapter || undefined,
    };
    restartStream(outlineData);
  }, [attachedFiles, getValues, trigger, restartStream]);

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
      topic: data.topic,
      grade: data.grade || undefined,
      subject: data.subject || undefined,
      chapter: data.chapter || undefined,
    };
    try {
      const result = await draftPresentation.mutateAsync(generationRequest);
      setRequest({
        ...generationRequest,

        outline,
        model: data.model,
        slideCount: data.slideCount,
        language: data.language,
        topic: data.topic,
        grade: data.grade || undefined,
        subject: data.subject || undefined,
        chapter: data.chapter || undefined,

        generationOptions: {
          // Default artStyle to empty string (allowed option) if not set
          artStyle: data.artStyle?.id ?? '',
          artStyleModifiers: data.artStyle?.modifiers,
          imageModel: data.imageModel ?? { name: '', provider: '' },
          negativePrompt: data.negativePrompt || undefined,
        },
      });
      clearOutline();
      setValue('topic', '');

      // Navigate to the detail page
      navigate(`/presentation/${result.id}?isGenerating=true`, { replace: true });
    } catch {
      toast.error(t('generation.presentationError'));
    }
  }, [trigger, markdownContent, getValues, navigate, t]);

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
    outlineError: error,
    isGeneratingPresentation: draftPresentation.isPending,
    stopStream,
    clearContent,

    // Form handlers
    handleRegenerateOutline,
    handleGeneratePresentation,

    // Only return needed form properties
    control: formHook.control,
    setValue: formHook.setValue,
    getValues: formHook.getValues,
  };
};
