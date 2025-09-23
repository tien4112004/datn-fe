import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner, { Spinner } from '@/shared/components/common/GlobalSpinner';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';
import { getDefaultPresentationTheme } from '../api/mock';
import { CriticalError } from '@/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { getSearchParamAsBoolean, setSearchParams } from '@/shared/utils/searchParams';
import { useAiResultById } from '../hooks/useApi';
import { useMessageRemote } from '../hooks/useMessageRemote';

interface VueEditorApp {
  onStreamData: (data: {
    slides: any[];
    viewport: {
      size: number;
      ratio: number;
    };
    theme: any;
  }) => Promise<void>;
}

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false);
  const [isProcessing, setIsProcessing] = useState(false);

  const app = useRef<VueEditorApp | null>(null);
  const updateApp = useCallback((newInstance: VueEditorApp) => {
    app.current = newInstance;
  }, []);
  const { isStreaming, streamedData } = usePresentationGeneration();
  const getAiResult = useAiResultById(id);

  useMessageRemote(); // Handle messages from remote Vue components

  if (!presentation && !isGeneratingParam) {
    throw new CriticalError(`Presentation with ID ${id} not found`, ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  // Process AI result if presentation isn't parsed
  useEffect(() => {
    const processAiResult = async () => {
      try {
        setIsProcessing(true);
        const aiResult = await getAiResult.mutateAsync();

        if (app.current) {
          await app.current.onStreamData({
            slides: aiResult,
            theme: getDefaultPresentationTheme(),
            viewport: {
              size: 1000,
              ratio: 9 / 16,
            },
          });
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
    if (isStreaming) {
      // During streaming, update the presentation with streamed data
      if (app.current) {
        app.current.onStreamData({
          slides: streamedData,
          theme: getDefaultPresentationTheme(),
          viewport: {
            size: 1000,
            ratio: 9 / 16,
          },
        });
      }
    } else {
      setSearchParams({ isGenerating: null });
    }
  }, [isStreaming, streamedData]);

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
