import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { useUpdatePresentation } from './useApi';

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

interface SavePresentationEventDetail {
  presentation: Presentation;
}

export const useSavePresentationRemote = (presentationId: string, vueApp?: VueEditorApp) => {
  const [isSaving, setIsSaving] = useState(false);
  const updatePresentation = useUpdatePresentation(presentationId);

  const handleSave = useCallback(
    async (event: CustomEvent<SavePresentationEventDetail>) => {
      try {
        setIsSaving(true);
        const { presentation: dataToSave } = event.detail;

        // Generate thumbnail using Vue app instance if available
        const thumbnail = await vueApp?.generateThumbnail?.();
        console.log(thumbnail);

        // Include thumbnail in the presentation data (thumbnail will be undefined if generation failed)
        const presentationWithThumbnail = {
          ...dataToSave,
          ...(thumbnail ? { thumbnail } : { thumbnail: dataToSave.thumbnail }),
        };

        // Save presentation with thumbnail
        await updatePresentation.mutateAsync(presentationWithThumbnail);
      } catch (error) {
        console.error('Failed to save presentation:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [updatePresentation, vueApp]
  );

  useEffect(() => {
    const listener = handleSave as unknown as EventListener;
    window.addEventListener('app.presentation.save', listener);

    return () => {
      window.removeEventListener('app.presentation.save', listener);
    };
  }, [handleSave]);

  return { isSaving };
};
