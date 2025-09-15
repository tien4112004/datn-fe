<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { X } from 'lucide-vue-next';
import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';
import DialogOverlay from './DialogOverlay.vue';

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="forwarded"
      :class="
        cn(
          'tw-bg-background data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 tw-fixed tw-left-[50%] tw-top-[50%] tw-z-50 tw-grid tw-w-full tw-max-w-[calc(100%-2rem)] tw-translate-x-[-50%] tw-translate-y-[-50%] tw-gap-4 tw-rounded-lg tw-border tw-p-6 tw-shadow-lg tw-duration-200 sm:tw-max-w-lg',
          props.class
        )
      "
    >
      <slot />

      <DialogClose
        class="tw-ring-offset-background focus:tw-ring-ring data-[state=open]:tw-bg-accent data-[state=open]:tw-text-muted-foreground tw-rounded-xs focus:tw-outline-hidden tw-absolute tw-right-4 tw-top-4 tw-opacity-70 tw-transition-opacity hover:tw-opacity-100 focus:tw-ring-2 focus:tw-ring-offset-2 disabled:tw-pointer-events-none [&_svg:not([class*='size-'])]:tw-size-4 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0"
      >
        <X />
        <span class="tw-sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
