/**
 * Animation Constants for Assessment Matrix Feature
 * Reusable animation classes and stagger delays
 */

// Animation Presets - using Tailwind's built-in animate-in utilities
export const ANIMATIONS = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-200',
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-200',
  slideInFromLeft: 'animate-in slide-in-from-left-2 duration-200',
  slideInFromRight: 'animate-in slide-in-from-right-2 duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
} as const;

// Stagger Delays - for sequential list item animations
export const STAGGER_DELAYS = {
  item1: 'delay-[0ms]',
  item2: 'delay-[50ms]',
  item3: 'delay-[100ms]',
  item4: 'delay-[150ms]',
  item5: 'delay-[200ms]',
  item6: 'delay-[250ms]',
  item7: 'delay-[300ms]',
  item8: 'delay-[350ms]',
} as const;

// Transform Effects - for hover and active states
export const TRANSFORMS = {
  scaleHover: 'hover:scale-[1.02]',
  scaleActive: 'active:scale-[0.98]',
  scaleInteractive: 'hover:scale-[1.02] active:scale-[0.98]',
  scaleLargeHover: 'hover:scale-105',
  translateUp: 'hover:-translate-y-0.5',
  translateUpSmall: 'hover:-translate-y-px',
  rotate90: 'hover:rotate-90',
  rotate180: 'hover:rotate-180',
} as const;

// Combined Animation Effects - common patterns
export const ANIMATION_COMBOS = {
  cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
  buttonPress: 'active:scale-[0.98] transition-transform duration-100',
  fadeInSlide: 'animate-in fade-in slide-in-from-bottom-2 duration-300',
  fadeInScale: 'animate-in fade-in zoom-in-95 duration-200',
  pulseRing: 'animate-pulse', // Can be extended with custom keyframes
} as const;

// Helper function to get stagger delay by index
export const getStaggerDelay = (index: number): string => {
  const delays = Object.values(STAGGER_DELAYS);
  return delays[Math.min(index, delays.length - 1)];
};

// MD3 Motion System - Material Design 3 motion tokens
export const MD3_MOTION = {
  // Duration tokens - Material Design 3 standard durations
  duration: {
    short1: 'duration-50', // 50ms - Small utility like icon buttons
    short2: 'duration-100', // 100ms - Simple interactions
    short3: 'duration-150', // 150ms - Icon state changes
    short4: 'duration-200', // 200ms - Small component transitions
    medium1: 'duration-250', // 250ms - Card/list item animations
    medium2: 'duration-300', // 300ms - Panel expansions
    medium3: 'duration-350', // 350ms - Complex component transitions
    medium4: 'duration-400', // 400ms - Large component animations
    long1: 'duration-450', // 450ms - Full screen transitions
    long2: 'duration-500', // 500ms - Complex state changes
    long3: 'duration-550', // 550ms - Large area transitions
    long4: 'duration-600', // 600ms - Full page transitions
  },

  // Easing tokens - MD3 standard easing curves
  easing: {
    standard: 'ease-[cubic-bezier(0.2,0,0,1)]', // Standard easing for most animations
    emphasized: 'ease-[cubic-bezier(0.2,0,0,1)]', // Emphasized easing for important transitions
    decelerate: 'ease-out', // Entering animations
    accelerate: 'ease-in', // Exiting animations
  },

  // Common MD3 animations
  fadeIn: 'animate-in fade-in',
  scaleIn: 'animate-in zoom-in-95',
  slideUp: 'animate-in slide-in-from-bottom-4',
  slideDown: 'animate-in slide-in-from-top-4',
  slideLeft: 'animate-in slide-in-from-right-4',
  slideRight: 'animate-in slide-in-from-left-4',
} as const;
