import { PresentationWrapper } from '@/features/presentation/components';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

const EditorPage = () => {
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

  return <PresentationWrapper />;
};

export default EditorPage;
