import { useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import useOutlineStore from '../stores/useOutlineStore';
import usePresentationStore from '../stores/usePresentationStore';

export const useGeneratingBlocker = (onProceed: () => void) => {
  const isOutlineGenerating = useOutlineStore((state) => state.isStreaming);
  const isPresentationGenerating = usePresentationStore((state) => state.isGenerating);
  const [showDialog, setShowDialog] = useState(false);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: any; nextLocation: any }) => {
        // Don't block navigation to presentation detail pages (intentional navigation after generation)
        const isNavigatingToPresentation = nextLocation.pathname.startsWith('/presentation/');

        const shouldBlock =
          (isOutlineGenerating || isPresentationGenerating) &&
          currentLocation.pathname !== nextLocation.pathname &&
          !isNavigatingToPresentation;

        if (shouldBlock) {
          setShowDialog(true);
        }
        return shouldBlock;
      },
      [isOutlineGenerating, isPresentationGenerating]
    )
  );

  const handleProceed = () => {
    setShowDialog(false);
    onProceed();
    blocker.proceed?.();
  };

  const handleStay = () => {
    setShowDialog(false);
    blocker.reset?.();
  };

  return {
    showDialog,
    setShowDialog,
    handleStay,
    handleProceed,
  };
};
