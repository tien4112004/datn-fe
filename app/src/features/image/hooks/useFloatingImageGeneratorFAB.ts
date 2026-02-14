import { useEffect } from 'react';
import { useFloatingImageGenerator } from '../context/FloatingImageGeneratorContext';

/**
 * Hook to enable the floating image generator FAB for the current page.
 * Automatically shows the FAB on mount and hides it on unmount.
 *
 * Usage:
 * ```tsx
 * export const MyPage = () => {
 *   useFloatingImageGeneratorFAB();
 *   // FAB will be visible while on this page
 * };
 * ```
 */
export const useFloatingImageGeneratorFAB = () => {
  const { showFAB, hideFAB } = useFloatingImageGenerator();

  useEffect(() => {
    showFAB();
    return () => {
      hideFAB();
    };
  }, [showFAB, hideFAB]);
};
