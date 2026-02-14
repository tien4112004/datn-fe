import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Popover } from '@/shared/components/ui/popover';
import type {
  FloatingImageGeneratorContextValue,
  FloatingImageGeneratorState,
  ContextAction,
} from '../types/floating';
import { FloatingImageGeneratorFAB } from '../components/floating/FloatingImageGeneratorFAB';
import { FloatingImageGeneratorPopover } from '../components/floating/FloatingImageGeneratorPopover';

/**
 * Context for managing the floating image generator state and actions globally
 */
const FloatingImageGeneratorContext = createContext<FloatingImageGeneratorContextValue | undefined>(
  undefined
);

/**
 * Provider component that makes the floating image generator available throughout the app.
 * Renders the FAB and Dialog internally, so they're always available.
 */
export const FloatingImageGeneratorProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<FloatingImageGeneratorState>({
    isOpen: false,
    isGenerating: false,
    generatedImage: null,
    error: null,
  });

  const [contextActions, setContextActions] = useState<ContextAction[]>([]);

  /**
   * Open the floating image generator dialog
   */
  const open = useCallback(() => {
    setIsOpen(true);
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  /**
   * Close the floating image generator dialog
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Reset to initial state: close dialog and clear generated image/errors
   */
  const reset = useCallback(() => {
    setState({
      isOpen: false,
      isGenerating: false,
      generatedImage: null,
      error: null,
    });
  }, []);

  /**
   * Register a context-specific action.
   * If an action with the same ID already exists, it will be replaced.
   */
  const registerContextAction = useCallback((action: ContextAction) => {
    setContextActions((prev) => {
      // Remove old action if exists
      const filtered = prev.filter((a) => a.id !== action.id);
      // Add new action
      return [...filtered, action];
    });
  }, []);

  /**
   * Unregister a context action by ID
   */
  const unregisterContextAction = useCallback((actionId: string) => {
    setContextActions((prev) => prev.filter((a) => a.id !== actionId));
  }, []);

  /**
   * Clear all registered context actions
   */
  const clearAllActions = useCallback(() => {
    setContextActions([]);
  }, []);

  /**
   * Show the floating action button
   */
  const showFAB = useCallback(() => {
    setIsVisible(true);
  }, []);

  /**
   * Hide the floating action button
   */
  const hideFAB = useCallback(() => {
    setIsVisible(false);
    // Also close the popover when hiding FAB
    setIsOpen(false);
  }, []);

  const value: FloatingImageGeneratorContextValue = {
    state,
    open,
    close,
    reset,
    contextActions,
    registerContextAction,
    unregisterContextAction,
    clearAllActions,
    showFAB,
    hideFAB,
    isFABVisible: isVisible,
  };

  return (
    <FloatingImageGeneratorContext.Provider value={value}>
      {children}
      {isVisible && (
        <Popover open={isOpen} onOpenChange={(newOpen) => (newOpen ? open() : close())}>
          <FloatingImageGeneratorFAB />
          <FloatingImageGeneratorPopover setState={setState} />
        </Popover>
      )}
    </FloatingImageGeneratorContext.Provider>
  );
};

/**
 * Hook to access the floating image generator context
 * Must be used within FloatingImageGeneratorProvider
 */
export const useFloatingImageGenerator = (): FloatingImageGeneratorContextValue => {
  const context = useContext(FloatingImageGeneratorContext);

  if (!context) {
    throw new Error('useFloatingImageGenerator must be used within FloatingImageGeneratorProvider');
  }

  return context;
};
