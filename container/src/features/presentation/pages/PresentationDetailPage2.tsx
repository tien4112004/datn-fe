import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner, { Spinner } from '@/shared/components/common/GlobalSpinner';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { Presentation, SlideLayoutSchema } from '../types';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';
import { getDefaultPresentationTheme } from '../api/mock';
import { CriticalError } from '@/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { getSearchParamAsBoolean, removeSearchParams } from '@/shared/utils/searchParams';
import { useAiResultById, useSetParsedPresentation, useUpdatePresentationSlides } from '../hooks/useApi';
import { useMessageRemote } from '../hooks/useMessageRemote';
import type { Slide, SlideTheme } from '../types/slide';

interface VueEditorApp {
  replaceSlides: (data: SlideLayoutSchema[]) => Promise<Slide[]>;
  addSlide: (data: SlideLayoutSchema, order?: number) => Promise<Slide>;
  updateThemeAndViewport: (theme: SlideTheme, viewport: { size: number; ratio: number }) => void;
}

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false);
  const [isProcessing, setIsProcessing] = useState(false);

  const app = useRef<VueEditorApp | null>(null);
  const updateApp = useCallback((newInstance: VueEditorApp) => {
    app.current = newInstance;

    // TODO: Update theme based on presentation or generation data
    app.current.updateThemeAndViewport(getDefaultPresentationTheme(), {
      size: 1000,
      ratio: 9 / 16,
    });
  }, []);

  if (!id) {
    throw new CriticalError('Presentation ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  if (!presentation && !isGeneratingParam) {
    throw new CriticalError(`Presentation with ID ${id} not found`, ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const { isStreaming, streamedData } = usePresentationGeneration();
  const updateSlides = useUpdatePresentationSlides(id);
  const setParsed = useSetParsedPresentation(id);
  const getAiResult = useAiResultById(id);

  // Track processed streamed data to only update new slides
  const processedStreamDataRef = useRef<SlideLayoutSchema[]>([]);

  useMessageRemote(); // Handle messages from remote Vue components

  // Process AI result if presentation isn't parsed
  useEffect(() => {
    const processAiResult = async () => {
      try {
        setIsProcessing(true);
        const aiResult = await getAiResult.mutateAsync();

        if (app.current) {
          const slides = await app.current.replaceSlides(aiResult);

          // Update presentation as parsed
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
        while (!app.current) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        processAiResult();
      };
      waitForApp();
    }
  }, []);

  useEffect(() => {
    const execute = async () => {
      if (isStreaming) {
        // During streaming, check if there's new data to process
        if (app.current && streamedData.length > processedStreamDataRef.current.length) {
          const newData = streamedData.slice(processedStreamDataRef.current.length);
          processedStreamDataRef.current = [...processedStreamDataRef.current, ...newData];

          for (let i = 0; i < newData.length; i++) {
            const slide = await app.current.addSlide(newData[i], processedStreamDataRef.current.length + i);
            await updateSlides.mutateAsync([slide]);
          }
        }
      } else {
        // Reset processed data when streaming stops
        processedStreamDataRef.current = [];
        removeSearchParams(['isGenerating']);
        await setParsed.mutateAsync();
      }
    };
    execute();
  }, [isStreaming, streamedData, updateSlides]);

  const { t } = useTranslation('loading');

  return (
    <>
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          titleTest: 'random',
          isRemote: true,
          presentation: presentation,
        }}
        className="vue-remote"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
        onMountSuccess={updateApp}
      />
      {isStreaming && app.current && <Spinner text={t('generatingPresentation')} />}
      {!isStreaming && isProcessing && <Spinner text={t('processingPresentation')} />}
    </>
  );
};

export default DetailPage;
