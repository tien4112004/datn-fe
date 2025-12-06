import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { t } from 'i18next';
import type { AiResultSlide, Presentation } from '../types';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';
import { getDefaultPresentationTheme } from '../api/mock';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { removeSearchParams } from '@/shared/utils/searchParams';
import {
  useAiResultById,
  useGeneratePresentationImage,
  useSetParsedPresentation,
  useUpdatePresentationSlides,
  useUpdatePresentation,
} from './useApi';
import type { Slide, SlideTheme, SlideViewport } from '../types/slide';

interface VueEditorApp {
  replaceSlides: (data: any[], theme?: SlideTheme) => Promise<Slide[]>;
  addSlide: (data: any, order?: number, theme?: SlideTheme) => Promise<Slide>;
  updateThemeAndViewport: (theme: SlideTheme, viewport: SlideViewport) => void;
  updateImageElement: (slideId: string, elementId: string, image: string) => void;
  clearSlides: () => void;
  parsed: () => void;
}

interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

export const useVueApp = (presentation: Presentation | null) => {
  const app = useRef<VueEditorApp | null>(null);

  const updateApp = useCallback((newInstance: VueEditorApp) => {
    app.current = newInstance;

    app.current.updateThemeAndViewport(
      presentation?.theme || getDefaultPresentationTheme(),
      presentation?.viewport || { width: 1000, height: 562.5 }
    );
  }, []);

  return { app: app.current, updateApp };
};

export const usePresentationDataProcessor = (
  presentation: Presentation | null,
  app: VueEditorApp | null,
  isStreaming: boolean,
  streamedData: AiResultSlide[],
  presentationId: string
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const processedStreamDataRef = useRef<AiResultSlide[]>([]);
  const pendingImageGenerations = useRef<Set<Promise<any>>>(new Set());

  const updateSlides = useUpdatePresentationSlides(presentationId);
  const setParsed = useSetParsedPresentation(presentationId);
  const getAiResult = useAiResultById(presentationId);
  const generateImage = useGeneratePresentationImage(presentationId);
  const { getRequest } = usePresentationGeneration();

  useEffect(() => {
    const processAiResult = async () => {
      try {
        setIsProcessing(true);

        const aiResult = await getAiResult.mutateAsync();

        if (app) {
          const slides = await app.replaceSlides(aiResult);

          await updateSlides.mutateAsync(slides);
          await setParsed.mutateAsync();
        }
      } catch (error) {
        console.error('Error processing AI result:', error);
        toast.error(t('common:presentation.processFailed'));
      } finally {
        setIsProcessing(false);
        app?.parsed();
      }
    };

    if (presentation && !presentation.isParsed && !isStreaming && !isProcessing) {
      const waitForApp = async () => {
        while (!app) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        processAiResult();
      };
      waitForApp();
    }
  }, [presentation, app]);

  useEffect(() => {
    const execute = async () => {
      if (isStreaming) {
        if (app && streamedData.length > processedStreamDataRef.current.length) {
          // Clear slides before adding new ones if this is the start of a new generation
          if (processedStreamDataRef.current.length === 0 && streamedData.length > 0) {
            app.clearSlides();
          }

          const newData = streamedData.slice(processedStreamDataRef.current.length);
          processedStreamDataRef.current = [...processedStreamDataRef.current, ...newData];

          for (let i = 0; i < newData.length; i++) {
            const slide = await app.addSlide(
              newData[i].result,
              newData[i].order,
              getRequest?.()?.presentation.theme || getDefaultPresentationTheme()
            );
            await updateSlides.mutateAsync([slide]);
          }
        }
      } else if (processedStreamDataRef.current.length > 0) {
        // Only process when streaming has ended and we have processed data
        processedStreamDataRef.current = [];
        removeSearchParams(['isGenerating']);

        // Wait a bit to ensure all image generation events are dispatched
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Wait for all pending image generations to complete before setting parsed
        if (pendingImageGenerations.current.size > 0) {
          await Promise.all(Array.from(pendingImageGenerations.current));
        }

        await setParsed.mutateAsync();
      }
    };
    execute();
  }, [isStreaming, streamedData, app]);

  useEffect(() => {
    const generateImageListener = async (event: Event) => {
      const customEvent = event as CustomEvent<{
        slideId: string;
        elementId: string;
        prompt: string;
      }>;
      const { slideId, elementId, prompt } = customEvent.detail;

      if (app) {
        const request = getRequest();
        if (!request?.others?.imageModel) {
          console.error('Image model not found in request');
          return;
        }

        const promise = generateImage
          .mutateAsync({
            slideId,
            elementId,
            prompt,
            model: request.others.imageModel,
          })
          .then((response) => {
            app.updateImageElement(slideId, elementId, response.images[0].url);
          })
          .catch((_) => {
            app.updateImageElement(slideId, elementId, '');
          })
          .finally(() => {
            pendingImageGenerations.current.delete(promise);
          });

        pendingImageGenerations.current.add(promise);
      }
    };

    const listener = generateImageListener as unknown as EventListener;
    window.addEventListener('app.image.need-generation', listener);

    return () => {
      window.removeEventListener('app.image.need-generation', listener);
    };
  }, [generateImage, getRequest]);

  return { isProcessing };
};

export const usePresentationValidation = (
  id: string | undefined,
  presentation: Presentation | null,
  isGeneratingParam: boolean
) => {
  if (!id) {
    throw new CriticalError('Presentation ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  if (!presentation && !isGeneratingParam) {
    throw new CriticalError(`Presentation with ID ${id} not found`, ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  return id;
};

export const useMessageRemote = () => {
  const handleMessage = useCallback((event: CustomEvent<MessageDetail>) => {
    const { type, message } = event.detail;
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
        toast.info(message);
        break;
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }, []);

  useEffect(() => {
    const listener = handleMessage as unknown as EventListener;
    window.addEventListener('app.message', listener);

    return () => {
      window.removeEventListener('app.message', listener);
    };
  }, [handleMessage]);
};

interface SavePresentationEventDetail {
  presentation: Presentation;
}

export const useSavePresentationRemote = (presentationId: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const updatePresentation = useUpdatePresentation(presentationId);

  const handleSave = useCallback(
    async (event: CustomEvent<SavePresentationEventDetail>) => {
      try {
        setIsSaving(true);
        const { presentation: dataToSave } = event.detail;

        const MINIMUM_DISPLAY_TIME = 500; // 500ms minimum to prevent flickering
        const savePromise = updatePresentation.mutateAsync(dataToSave);
        const timerPromise = new Promise((resolve) => setTimeout(resolve, MINIMUM_DISPLAY_TIME));
        await Promise.all([savePromise, timerPromise]);
      } catch (error) {
        console.error('Failed to save presentation:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [updatePresentation]
  );

  useEffect(() => {
    const listener = handleSave as unknown as EventListener;
    window.addEventListener('app.presentation.save', listener);

    return () => {
      window.removeEventListener('app.presentation.save', listener);
    };
  }, [handleSave]);

  return { isSaving };
};

export const useDetailPresentation = (
  presentation: Presentation | null,
  id: string | undefined,
  isGeneratingParam: boolean
) => {
  const validatedId = usePresentationValidation(id, presentation, isGeneratingParam);
  const { app, updateApp } = useVueApp(presentation);

  const { isStreaming, streamedData } = usePresentationGeneration();
  const { isProcessing } = usePresentationDataProcessor(
    presentation,
    app,
    isStreaming,
    streamedData,
    validatedId
  );

  useMessageRemote();
  const { isSaving } = useSavePresentationRemote(validatedId);

  return { app, updateApp, isProcessing, isStreaming, isSaving };
};
