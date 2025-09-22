import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner, { Spinner } from '@/shared/components/common/GlobalSpinner';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';
import { getPresentationById } from '../hooks';
import { getDefaultPresentationTheme } from '../api/mock';

export interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

const DetailPage = () => {
  //   const { presentation: loaderPresentation } = useLoaderData() as { presentation: Presentation };
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { id } = useParams<{ id: string }>();
  const app = useRef<any>(null);
  const updateApp = useCallback((newInstance: any) => {
    app.current = newInstance;
  }, []);

  const { isStreaming, streamedData } = usePresentationGeneration();

  // On mount, load the presentation if not streaming
  useEffect(() => {
    if (!isStreaming) {
      setIsProcessing(true);
      getPresentationById({ params: { id } }).then(({ presentation }) => {
        setPresentation(presentation);
        setIsProcessing(false);
      });
    }
  }, []);

  useEffect(() => {
    if (isStreaming) {
      // During streaming, update the presentation with streamed data
      app.current?.onStreamData({
        slides: streamedData,
        theme: getDefaultPresentationTheme(),
        viewport: {
          size: 1000,
          ratio: 9 / 16,
        },
      });
    }
  }, [isStreaming, streamedData]);

  const { t } = useTranslation('loading');

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
      {isStreaming && <Spinner text="Generating presentation..." />}
    </>
  );
};

export default DetailPage;
