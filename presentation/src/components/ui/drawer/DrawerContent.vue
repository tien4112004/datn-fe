<script lang="ts" setup>
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { useForwardPropsEmits } from 'reka-ui';
import { DrawerContent, DrawerPortal } from 'vaul-vue';
import { cn } from '@/lib/utils';
import DrawerOverlay from './DrawerOverlay.vue';

const props = defineProps<
  DialogContentProps & {
    class?: HTMLAttributes['class'];
    style?: HTMLAttributes['style'];
  }
>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      data-slot="drawer-content"
      v-bind="forwarded"
      :class="
        cn(
          `group/drawer-content tw-bg-background tw-fixed tw-z-50 tw-flex tw-h-auto tw-flex-col`,
          `data-[vaul-drawer-direction=top]:tw-top-0 data-[vaul-drawer-direction=top]:tw-mb-24 data-[vaul-drawer-direction=top]:tw-max-h-[80vh] data-[vaul-drawer-direction=top]:tw-rounded-b-lg data-[vaul-drawer-direction=top]:tw-inset-x-0`,
          `data-[vaul-drawer-direction=bottom]:tw-bottom-0 data-[vaul-drawer-direction=bottom]:tw-mt-24 data-[vaul-drawer-direction=bottom]:tw-max-h-[80vh] data-[vaul-drawer-direction=bottom]:tw-rounded-t-lg data-[vaul-drawer-direction=bottom]:tw-inset-x-0`,
          `data-[vaul-drawer-direction=right]:tw-right-0 data-[vaul-drawer-direction=right]:tw-w-3/4 data-[vaul-drawer-direction=right]:tw-inset-y-0 data-[vaul-drawer-direction=right]:sm:tw-max-w-sm`,
          `data-[vaul-drawer-direction=left]:tw-left-0 data-[vaul-drawer-direction=left]:tw-w-3/4 data-[vaul-drawer-direction=left]:tw-inset-y-0 data-[vaul-drawer-direction=left]:sm:tw-max-w-sm`,
          props.class
        )
      "
      :style="props.style"
    >
      <div
        class="tw-bg-muted tw-mx-auto tw-mt-4 tw-hidden tw-h-2 tw-w-[100px] tw-shrink-0 tw-rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
      />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
