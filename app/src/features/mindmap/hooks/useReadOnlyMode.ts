import { useState, useCallback } from 'react';

/**
 * Custom hook for managing read-only mode
 * Provides toggle functionality to enable/disable read-only mode in mindmap
 */
export const useReadOnlyMode = () => {
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Enable read-only mode
  const enableReadOnly = useCallback(() => {
    setIsReadOnly(true);
  }, []);

  // Disable read-only mode
  const disableReadOnly = useCallback(() => {
    setIsReadOnly(false);
  }, []);

  // Toggle read-only mode
  const toggleReadOnly = useCallback(() => {
    setIsReadOnly((prev) => !prev);
  }, []);

  return {
    isReadOnly,
    toggleReadOnly,
    enableReadOnly,
    disableReadOnly,
  };
};
