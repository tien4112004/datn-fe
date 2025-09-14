import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as Alert } from './Alert.vue';
export { default as AlertDescription } from './AlertDescription.vue';
export { default as AlertTitle } from './AlertTitle.vue';

export const alertVariants = cva(
  'tw-relative tw-w-full tw-rounded-lg tw-border tw-px-4 tw-py-3 tw-text-sm tw-grid has-[>svg]:tw-grid-cols-[calc(var(--presentation-spacing)*4)_1fr] tw-grid-cols-[0_1fr] has-[>svg]:tw-gap-x-3 tw-gap-y-0.5 tw-items-start [&>svg]:tw-size-4 [&>svg]:tw-translate-y-0.5 [&>svg]:tw-text-current',
  {
    variants: {
      variant: {
        default: 'tw-bg-card tw-text-card-foreground',
        destructive:
          'tw-text-destructive tw-bg-card [&>svg]:tw-text-current *:data-[slot=alert-description]:tw-text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type AlertVariants = VariantProps<typeof alertVariants>;
