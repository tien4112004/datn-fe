<script setup lang="ts">
import type { ComboboxContentEmits, ComboboxContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxContent, ComboboxPortal, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<ComboboxContentProps & { class?: HTMLAttributes['class'] }>(), {
  position: 'popper',
  align: 'center',
  sideOffset: 4,
});
const emits = defineEmits<ComboboxContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxPortal>
    <ComboboxContent
      data-slot="combobox-list"
      v-bind="forwarded"
      :class="
        cn(
          'tw-bg-popover tw-text-popover-foreground origin-(--reka-combobox-content-transform-origin) data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2 tw-z-50 tw-w-[200px] tw-overflow-hidden tw-rounded-md tw-border tw-shadow-md tw-outline-none',
          props.class
        )
      "
    >
      <slot />
    </ComboboxContent>
  </ComboboxPortal>
</template>
