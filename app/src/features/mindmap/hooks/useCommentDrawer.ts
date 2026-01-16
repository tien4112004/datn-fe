import { useCallback, useEffect } from 'react';

/**
 * Hook to listen for comment drawer open requests
 * Can be triggered via custom event 'app.mindmap.open-comments'
 */
export const useCommentDrawerTrigger = (onOpen: () => void) => {
  const handleOpenComments = useCallback(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    const listener = handleOpenComments as unknown as EventListener;
    window.addEventListener('app.mindmap.open-comments', listener);

    return () => {
      window.removeEventListener('app.mindmap.open-comments', listener);
    };
  }, [handleOpenComments]);
};
