<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { MoreHorizontal } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    :class="cn('tw-flex tw-size-9 tw-items-center tw-justify-center', props.class)"
  >
    <slot>
      <MoreHorizontal class="tw-size-4" />
    </slot>
    <span class="tw-sr-only">More</span>
  </span>
</template>
