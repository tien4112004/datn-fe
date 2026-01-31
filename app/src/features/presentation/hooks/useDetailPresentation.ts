import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Presentation } from '../types';
import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import usePresentationStore from '../stores/usePresentationStore';

export interface VueEditorApp {
  generateThumbnail?: () => Promise<string | undefined>;
}

interface MessageDetail {
  type: 'success' | 'error' | 'warning' | 'info' | string;
  message: string;
}

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

/**
 * Hook to listen for generating state events from Vue and update the Zustand store
 * This syncs the Vue generating state with the React store
 */
export const useGeneratingStoreSync = () => {
  const setIsGenerating = usePresentationStore((state) => state.setIsGenerating);

  const handleGeneratingStateChange = useCallback(
    (event: CustomEvent<{ isGenerating: boolean }>) => {
      setIsGenerating(event.detail.isGenerating);
    },
    [setIsGenerating]
  );

  useEffect(() => {
    const listener = handleGeneratingStateChange as unknown as EventListener;
    window.addEventListener('app.presentation.generating', listener);

    return () => {
      window.removeEventListener('app.presentation.generating', listener);
    };
  }, [handleGeneratingStateChange]);
};

/**
 * Hook to listen for comment drawer open requests from Vue
 * The Vue app emits this event when the user clicks the comment button
 */
export const useCommentDrawerTrigger = (onOpen: () => void) => {
  const handleOpenComments = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    const listener = handleOpenComments as unknown as EventListener;
    window.addEventListener('app.presentation.open-comments', listener);

    return () => {
      window.removeEventListener('app.presentation.open-comments', listener);
    };
  }, [handleOpenComments]);
};

/**
 * Hook to listen for navigation requests from Vue
 * This allows Vue to request navigation through React Router,
 * which properly triggers the unsaved changes blocker
 */
export const useNavigationRequest = (navigate: (path: string) => void) => {
  const handleNavigationRequest = useCallback(
    (event: CustomEvent<{ path: string }>) => {
      navigate(event.detail.path);
    },
    [navigate]
  );

  useEffect(() => {
    const listener = handleNavigationRequest as unknown as EventListener;
    window.addEventListener('app.presentation.navigate', listener);

    return () => {
      window.removeEventListener('app.presentation.navigate', listener);
    };
  }, [handleNavigationRequest]);
};
