import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { t } from 'i18next';
import type { Presentation } from '../types';
import { getDefaultPresentationTheme } from '../api/mock';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import type { SlideTheme, SlideViewport } from '../types/slide';

interface VueEditorApp {
  updateThemeAndViewport?: (theme: SlideTheme, viewport: SlideViewport) => void;
}

interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

/**
 * Simplified hook that validates presentation data and maintains Vue app reference
 * All processing logic has been moved to Vue (usePresentationProcessor)
 */
export const useDetailPresentation = (
  presentation: Presentation | null,
  id: string | undefined,
  isGeneratingParam: boolean
) => {
  // Validation
  if (!id) {
    throw new CriticalError('Presentation ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  if (!presentation && !isGeneratingParam) {
    throw new CriticalError(`Presentation with ID ${id} not found`, ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const appRef = useRef<VueEditorApp | null>(null);

  const updateApp = useCallback(
    (newInstance: VueEditorApp) => {
      appRef.current = newInstance;

      // Update theme and viewport if app instance has the method
      appRef.current?.updateThemeAndViewport?.(
        presentation?.theme || getDefaultPresentationTheme(),
        presentation?.viewport || { width: 1000, height: 562.5 }
      );
    },
    [presentation]
  );

  // Listen to Vue message events and convert to React toasts
  useEffect(() => {
    const handleMessage = (event: Event) => {
      const customEvent = event as CustomEvent<MessageDetail>;
      const { type, message } = customEvent.detail;
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
    };

    const listener = handleMessage as EventListener;
    window.addEventListener('app.message', listener);
    return () => window.removeEventListener('app.message', listener);
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleSave = async () => {
      try {
        setIsSaving(true);
        // Save is handled by Vue's API call
        // React just needs to show loading state
      } catch (error) {
        console.error('Failed to save presentation:', error);
        toast.error(t('common:presentation.saveFailed'));
      } finally {
        setIsSaving(false);
      }
    };

    const listener = handleSave as EventListener;
    window.addEventListener('app.presentation.save', listener);
    return () => window.removeEventListener('app.presentation.save', listener);
  }, []);

  return {
    app: appRef.current,
    updateApp,
    isStreaming: false,
    isSaving,
  };
};
