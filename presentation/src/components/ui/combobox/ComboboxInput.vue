<script setup lang="ts">
import type { ComboboxInputEmits, ComboboxInputProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SearchIcon } from 'lucide-vue-next';
import { ComboboxInput, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  ComboboxInputProps & {
    class?: HTMLAttributes['class'];
  }
>();

const emits = defineEmits<ComboboxInputEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <div data-slot="command-input-wrapper" class="tw-flex tw-h-9 tw-items-center tw-gap-2 tw-border-b tw-px-3">
    <SearchIcon class="tw-size-4 tw-shrink-0 tw-opacity-50" />
    <ComboboxInput
      data-slot="command-input"
      :class="
        cn(
          'placeholder:tw-text-muted-foreground tw-outline-hidden tw-flex tw-h-10 tw-w-full tw-rounded-md tw-bg-transparent tw-py-3 tw-text-sm disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
          props.class
        )
      "
      v-bind="{ ...forwarded, ...$attrs }"
    >
      <slot />
    </ComboboxInput>
  </div>
</template>
