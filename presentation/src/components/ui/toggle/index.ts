import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Toggle } from './Toggle.vue';

export const toggleVariants = cva(
  "tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-text-sm tw-font-medium hover:tw-bg-muted hover:tw-text-muted-foreground disabled:tw-pointer-events-none disabled:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg:not([class*='size-'])]:tw-size-4 [&_svg]:tw-shrink-0 focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 focus-visible:tw-ring-[3px] tw-outline-none tw-transition-[color,box-shadow] aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive tw-whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'tw-bg-transparent',
        outline:
          'tw-border tw-border-muted tw-bg-transparent tw-shadow-xs hover:tw-bg-accent hover:tw-text-accent-foreground',
      },
      size: {
        default: 'tw-h-9 tw-px-2 tw-min-w-9',
        sm: 'tw-h-8 tw-px-1.5 tw-min-w-8',
        lg: 'tw-h-10 tw-px-2.5 tw-min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;
