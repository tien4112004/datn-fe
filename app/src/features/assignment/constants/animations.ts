/**
 * Animation Constants for Assignment/Question-Bank Feature
 * Reusable animation classes and MD3 motion system
 */

// Animation Presets
export const ANIMATIONS = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-200',
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
} as const;

// Stagger Delays
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

// Transform Effects
export const TRANSFORMS = {
  scaleHover: 'hover:scale-[1.02]',
  scaleActive: 'active:scale-[0.98]',
  scaleInteractive: 'hover:scale-[1.02] active:scale-[0.98]',
  translateUp: 'hover:-translate-y-0.5',
} as const;

// MD3 Motion System
export const MD3_MOTION = {
  duration: {
    short1: 'duration-50',
    short2: 'duration-100',
    short3: 'duration-150',
    short4: 'duration-200',
    medium1: 'duration-250',
    medium2: 'duration-300',
    medium3: 'duration-350',
    medium4: 'duration-400',
    long1: 'duration-450',
    long2: 'duration-500',
  },
  easing: {
    standard: 'ease-[cubic-bezier(0.2,0,0,1)]',
    emphasized: 'ease-[cubic-bezier(0.2,0,0,1)]',
    decelerate: 'ease-out',
    accelerate: 'ease-in',
  },
  fadeIn: 'animate-in fade-in',
  scaleIn: 'animate-in zoom-in-95',
  slideUp: 'animate-in slide-in-from-bottom-4',
} as const;

export const getStaggerDelay = (index: number): string => {
  const delays = Object.values(STAGGER_DELAYS);
  return delays[Math.min(index, delays.length - 1)];
};
