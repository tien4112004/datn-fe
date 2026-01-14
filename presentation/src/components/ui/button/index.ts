import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  "tw-inline-flex tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-transition-all disabled:tw-pointer-events-none disabled:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg:not([class*='size-'])]:tw-size-4 tw-shrink-0 [&_svg]:tw-shrink-0 tw-outline-none focus-visible:tw-ring-ring/50 focus-visible:tw-ring-[3px]",
  {
    variants: {
      variant: {
        default: 'tw-bg-primary tw-text-primary-foreground tw-shadow-xs hover:tw-bg-accent',
        destructive:
          'tw-bg-destructive tw-text-white tw-shadow-xs hover:tw-bg-destructive/90 focus-visible:tw-ring-destructive/20 dark:focus-visible:tw-ring-destructive/40 dark:tw-bg-destructive/60',
        outline:
          'tw-border tw-border-border tw-bg-background tw-shadow-xs hover:tw-border-accent hover:tw-text-primary focus-visible:!tw-border-red-500 aria-invalid:!tw-border-red-500 dark:tw-bg-input/30 dark:!tw-border-red-500 dark:hover:tw-bg-input/50',
        secondary: 'tw-bg-secondary tw-text-secondary-foreground tw-shadow-xs hover:tw-bg-secondary/80',
        ghost: 'hover:tw-bg-accent hover:tw-text-accent-foreground dark:hover:tw-bg-accent/50',
        link: 'tw-text-primary tw-underline-offset-4 hover:tw-underline',
      },
      size: {
        default: 'tw-h-9 tw-px-4 tw-py-2 has-[>svg]:tw-px-3',
        sm: 'tw-h-7 tw-rounded-md tw-gap-1.5 tw-px-2 has-[>svg]:tw-px-2.5',
        lg: 'tw-h-10 tw-rounded-md tw-px-6 has-[>svg]:tw-px-4',
        icon: 'tw-size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
