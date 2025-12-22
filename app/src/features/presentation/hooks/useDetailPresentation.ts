import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';

export interface VueEditorApp {
  generateThumbnail?: () => Promise<string | undefined>;
}

interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

// Hook to manage Vue app instance reference
export const useVueApp = () => {
  const app = useRef<VueEditorApp | null>(null);

  const updateApp = useCallback((newInstance: VueEditorApp) => {
    app.current = newInstance;
  }, []);

  return { app, updateApp };
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

  // Additional validation when presentation exists
  if (presentation) {
    // Validate required fields
    if (!presentation.id) {
      throw new CriticalError('Presentation data is invalid: missing ID', ERROR_TYPE.RESOURCE_NOT_FOUND);
    }

    if (presentation.title === undefined || presentation.title === null) {
      throw new CriticalError('Presentation data is invalid: missing title', ERROR_TYPE.RESOURCE_NOT_FOUND);
    }

    // Warn about empty presentations (don't throw, just log)
    if (presentation.slides && presentation.slides.length === 0) {
      console.warn(`Presentation ${id} has no slides`);
      // Don't throw - empty presentations are valid (user might be building it)
    }
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

/**
 * Simplified hook to listen for saving state events from Vue
 * Used only for showing GlobalSpinner, all save logic is handled in Vue
 */
export const useSavingIndicator = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSavingStateChange = useCallback((event: CustomEvent<{ isSaving: boolean }>) => {
    setIsSaving(event.detail.isSaving);
  }, []);

  useEffect(() => {
    const listener = handleSavingStateChange as unknown as EventListener;
    window.addEventListener('app.presentation.saving', listener);

    return () => {
      window.removeEventListener('app.presentation.saving', listener);
    };
  }, [handleSavingStateChange]);

  return { isSaving };
};
