import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Badge } from './Badge.vue';

export const badgeVariants = cva(
  'tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-border tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-w-fit tw-whitespace-nowrap tw-shrink-0 [&>svg]:tw-size-3 tw-gap-1 [&>svg]:tw-pointer-events-none focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 focus-visible:tw-ring-[3px] aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive tw-transition-[color,box-shadow] tw-overflow-hidden',
  {
    variants: {
      variant: {
        default: 'tw-border-transparent tw-bg-primary tw-text-primary-foreground [a&]:hover:tw-bg-primary/90',
        secondary:
          'tw-border-transparent tw-bg-secondary tw-text-secondary-foreground [a&]:hover:tw-bg-secondary/90',
        destructive:
          'tw-border-transparent tw-bg-destructive tw-text-white [a&]:hover:tw-bg-destructive/90 focus-visible:tw-ring-destructive/20 dark:focus-visible:tw-ring-destructive/40 dark:tw-bg-destructive/60',
        outline: 'tw-text-foreground [a&]:hover:tw-bg-accent [a&]:hover:tw-text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;
