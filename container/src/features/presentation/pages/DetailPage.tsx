import VueRemoteWrapper from '@/features/presentation/components/remote/VueRemoteWrapper';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router-dom';
import { toast } from 'sonner';
import type { Presentation } from '../types';

export interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

const DetailPage = () => {
  const { presentation } = useLoaderData() as { presentation: Presentation };
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
