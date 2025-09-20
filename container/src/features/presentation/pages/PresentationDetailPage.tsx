import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import usePresentationStore from '../stores/usePresentationStore';
import { useAiResultById } from '../hooks/useApi';
import { processGeneratedSlides } from '../utils';
import { getDefaultPresentationTheme } from '../api/mock';

export interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

const DetailPage = () => {
  const { presentation: loaderPresentation } = useLoaderData() as { presentation: Presentation };
  const { id } = useParams<{ id: string }>();
  const [presentation, setPresentation] = useState<Presentation>(loaderPresentation);
  const [isProcessing, setIsProcessing] = useState(false);

  const { t } = useTranslation('loading');
  const generatedPresentation = usePresentationStore((state) => state.generatedPresentation);
  const clearGeneratedPresentation = usePresentationStore((state) => state.clearGeneratedPresentation);
  const getAiResult = useAiResultById(id);

  // Process generated presentation if needed
  useEffect(() => {
    const processPresentation = async () => {
      if (
        generatedPresentation &&
        (!presentation.isParsed || presentation.id === generatedPresentation.presentation.id)
      ) {
        setIsProcessing(true);
        try {
          const theme = getDefaultPresentationTheme();
          const processedSlides = await processGeneratedSlides(
            generatedPresentation.aiResult,
            {
              size: 1000,
              ratio: 9 / 16,
            },
            theme
          );

          const processedPresentation = {
            ...generatedPresentation.presentation,
            slides: processedSlides,
          };

          setPresentation(processedPresentation);
          clearGeneratedPresentation();
        } catch (error) {
          console.error('Error processing generated presentation:', error);
          toast.error('Failed to process presentation');
        } finally {
          setIsProcessing(false);
        }
      } else if (!presentation.isParsed && !generatedPresentation) {
        // If presentation is not parsed and no generated data, call AI Result
        setIsProcessing(true);
        const aiResult = await getAiResult.mutateAsync();

        if (aiResult) {
          const processedSlides = await processGeneratedSlides(
            aiResult,
            { size: 1000, ratio: 9 / 16 },
            getDefaultPresentationTheme()
          );
          setPresentation({ ...presentation, slides: processedSlides });
        }

        setIsProcessing(false);
      }
    };

    processPresentation();
  }, [generatedPresentation, presentation.isParsed, presentation.id, clearGeneratedPresentation]);

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

  if (isProcessing) {
    return <GlobalSpinner text="Processing presentation..." />;
  }

  return (
    <VueRemoteWrapper
      modulePath="editor"
      mountProps={{
        titleTest: 'random',
        isRemote: true,
        presentation: presentation,
      }}
      className="vue-remote"
      LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
    />
  );
};

export default DetailPage;
