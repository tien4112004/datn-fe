import type { ImageData } from './service';

/**
 * Represents a single context-aware action that can be performed with a generated image.
 * These are registered by pages/components to provide page-specific functionality.
 * Example: AssignmentEditorPage registers "Add to Current Question" action
 */
export interface ContextAction {
  /** Unique identifier for this action (e.g., 'add-to-question', 'add-to-option-0') */
  id: string;

  /** Display label for the button (e.g., 'Add to Question Title') */
  label: string;

  /** Optional icon component to display on the button */
  icon?: React.ComponentType<{ className?: string }>;

  /** Button styling variant */
  variant?: 'default' | 'secondary' | 'outline';

  /** Handler function called when action is clicked. Can be sync or async. */
  handler: (imageUrl: string, imageData: ImageData) => void | Promise<void>;
}

/**
 * Current state of the floating image generator
 */
export interface FloatingImageGeneratorState {
  /** Whether the generator dialog is open */
  isOpen: boolean;

  /** Whether an image generation request is in progress */
  isGenerating: boolean;

  /** The most recently generated image (null if none or error) */
  generatedImage: ImageData | null;

  /** Error message from image generation (null if no error) */
  error: string | null;
}

/**
 * Context value provided by FloatingImageGeneratorProvider
 */
export interface FloatingImageGeneratorContextValue {
  /** Current state of the generator */
  state: FloatingImageGeneratorState;

  /** Open the generator dialog */
  open: () => void;

  /** Close the generator dialog */
  close: () => void;

  /** Reset to initial state (close dialog, clear generated image and errors) */
  reset: () => void;

  /** Array of currently registered context-specific actions */
  contextActions: ContextAction[];

  /** Register a new context action (replaces if ID already exists) */
  registerContextAction: (action: ContextAction) => void;

  /** Unregister a context action by ID */
  unregisterContextAction: (actionId: string) => void;

  /** Clear all registered context actions */
  clearAllActions: () => void;

  /** Show the floating action button */
  showFAB: () => void;

  /** Hide the floating action button */
  hideFAB: () => void;

  /** Whether the floating action button is currently visible */
  isFABVisible: boolean;
}
