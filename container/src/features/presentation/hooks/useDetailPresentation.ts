import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { AiResultSlide, Presentation } from '../types';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';
import { getDefaultPresentationTheme } from '../api/mock';
import { CriticalError } from '@/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { removeSearchParams } from '@/shared/utils/searchParams';
import {
  useAiResultById,
  useGeneratePresentationImage,
  useSetParsedPresentation,
  useUpdatePresentationSlides,
} from './useApi';
import type { Slide, SlideTheme } from '../types/slide';

interface VueEditorApp {
  replaceSlides: (data: any[], theme?: SlideTheme) => Promise<Slide[]>;
  addSlide: (data: any, order?: number, theme?: SlideTheme) => Promise<Slide>;
  updateThemeAndViewport: (theme: SlideTheme, viewport: { size: number; ratio: number }) => void;
  updateImageElement: (slideId: string, elementId: string, image: string) => void;
}

interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

export const useVueApp = (presentation: Presentation | null) => {
  const app = useRef<VueEditorApp | null>(null);

  const updateApp = useCallback((newInstance: VueEditorApp) => {
    app.current = newInstance;

    app.current.updateThemeAndViewport(presentation?.theme || getDefaultPresentationTheme(), {
      size: 1000,
      ratio: 9 / 16,
    });
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
        toast.error('Failed to process presentation');
      } finally {
        setIsProcessing(false);
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
          const newData = streamedData.slice(processedStreamDataRef.current.length);
          processedStreamDataRef.current = [...processedStreamDataRef.current, ...newData];

          for (let i = 0; i < newData.length; i++) {
            const slide = await app.addSlide(
              newData[i].result,
              newData[i].order,
              getRequest?.()?.others.theme || getDefaultPresentationTheme()
            );
            await updateSlides.mutateAsync([slide]);
          }
        }
      } else {
        processedStreamDataRef.current = [];
        removeSearchParams(['isGenerating']);

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
      const customEvent = event as CustomEvent;
      const { slideId, elementId, prompt } = customEvent.detail;

      if (app) {
        const promise = generateImage
          .mutateAsync({
            slideId,
            elementId,
            prompt,
            model: getRequest()?.others.imageModel,
          })
          .then((response) => {
            app.updateImageElement(slideId, elementId, response.images[0].url);
          })
          .finally(() => {
            pendingImageGenerations.current.delete(promise);
          });

        pendingImageGenerations.current.add(promise);
      }
    };

    window.addEventListener('app.image.need-generation', generateImageListener);

    return () => {
      window.removeEventListener('app.image.need-generation', generateImageListener);
    };
  }, [generateImage]);

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
    window.addEventListener('app.message', handleMessage);

    return () => {
      window.removeEventListener('app.message', handleMessage);
    };
  }, [handleMessage]);
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

  return { app, updateApp, isProcessing, isStreaming };
};
