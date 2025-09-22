import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner, { Spinner } from '@/shared/components/common/GlobalSpinner';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import { usePresentationGeneration } from '../contexts/PresentationGenerationContext';
import { getDefaultPresentationTheme } from '../api/mock';
import { CriticalError } from '@/types/errors';
import { ERROR_TYPE } from '@/shared/constants';
import { getSearchParamAsBoolean, removeSearchParams } from '@/shared/utils/searchParams';

export interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

const DetailPage = () => {
  const { presentation: loaderPresentation } = useLoaderData() as { presentation: Presentation | null };
  const { id } = useParams<{ id: string }>();
  const isGeneratingParam = getSearchParamAsBoolean('isGenerating', false);

  const app = useRef<any>(null);
  const updateApp = useCallback((newInstance: any) => {
    app.current = newInstance;
  }, []);
  const { isStreaming, streamedData } = usePresentationGeneration();

  if (!loaderPresentation && !isGeneratingParam) {
    throw new CriticalError(`Presentation with ID ${id} not found`, ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

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
    } else {
      removeSearchParams(['isGenerating']);
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

  return (
    <>
      <VueRemoteWrapper
        modulePath="editor"
        mountProps={{
          titleTest: 'random',
          isRemote: true,
          presentation: loaderPresentation,
        }}
        className="vue-remote"
        LoadingComponent={() => <GlobalSpinner text={t('presentation')} />}
        onMountSuccess={updateApp}
      />
      {isStreaming && app.current && <Spinner text={t('generatingPresentation')} />}
    </>
  );
};

export default DetailPage;
