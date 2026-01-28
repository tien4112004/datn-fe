<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { AlertDialogContent, AlertDialogOverlay, AlertDialogPortal, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<AlertDialogContentProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<AlertDialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <AlertDialogPortal to="body">
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 tw-fixed tw-inset-0 tw-z-[9999] tw-bg-black/80"
    />
    <AlertDialogContent
      data-slot="alert-dialog-content"
      v-bind="forwarded"
      :class="
        cn(
          'tw-bg-background data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 tw-fixed tw-left-[50%] tw-top-[50%] tw-z-[10000] tw-grid tw-w-full tw-max-w-[calc(100%-2rem)] tw-translate-x-[-50%] tw-translate-y-[-50%] tw-gap-4 tw-rounded-lg tw-border tw-p-6 tw-shadow-lg tw-duration-200 sm:tw-max-w-lg',
          props.class
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
