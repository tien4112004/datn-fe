import { useState, useCallback } from 'react';

/**
 * Custom hook for managing Presenter Mode
 * Provides toggle functionality to enable/disable presenter mode in mindmap
 */
export const usePresenterMode = () => {
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  // Enable presenter mode
  const enablePresenterMode = useCallback(() => {
    setIsPresenterMode(true);
  }, []);

  // Disable presenter mode
  const disablePresenterMode = useCallback(() => {
    setIsPresenterMode(false);
  }, []);

  // Toggle presenter mode
  const togglePresenterMode = useCallback(() => {
    setIsPresenterMode((prev) => !prev);
  }, []);

  return {
    isPresenterMode,
    togglePresenterMode,
    enablePresenterMode,
    disablePresenterMode,
  };
};
