import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing fullscreen mode
 * Handles browser-specific fullscreen APIs and provides toggle functionality
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if document is currently in fullscreen mode
  const checkFullscreen = useCallback(() => {
    const fullscreenElement =
      document.fullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement ||
      (document as any).webkitCurrentFullScreenElement;

    return !!fullscreenElement;
  }, []);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(() => {
    const docElm = document.documentElement;

    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if ((docElm as any).mozRequestFullScreen) {
      (docElm as any).mozRequestFullScreen();
    } else if ((docElm as any).webkitRequestFullScreen) {
      (docElm as any).webkitRequestFullScreen();
    } else if ((docElm as any).msRequestFullscreen) {
      (docElm as any).msRequestFullscreen();
    }
  }, []);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (checkFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [checkFullscreen, enterFullscreen, exitFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkFullscreen());
    };

    // Listen to fullscreen change events (multiple for cross-browser compatibility)
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial check
    setIsFullscreen(checkFullscreen());

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [checkFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
};
