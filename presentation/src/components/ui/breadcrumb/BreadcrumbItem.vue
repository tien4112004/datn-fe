<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <li data-slot="breadcrumb-item" :class="cn('tw-items-center tw-gap-1.5 inline-flex', props.class)">
    <slot />
  </li>
</template>
