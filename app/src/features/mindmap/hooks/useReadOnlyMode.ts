import { usePresenterMode } from './usePresenterMode';

/**
 * Backwards-compatible wrapper for old read-only hook; maps to Presenter Mode
 */
export const useReadOnlyMode = () => {
  const { isPresenterMode, togglePresenterMode, enablePresenterMode, disablePresenterMode } =
    usePresenterMode();

  return {
    isReadOnly: isPresenterMode,
    toggleReadOnly: togglePresenterMode,
    enableReadOnly: enablePresenterMode,
    disableReadOnly: disablePresenterMode,
  };
};
