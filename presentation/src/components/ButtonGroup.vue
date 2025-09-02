<template>
  <div
    :class="cn('inline-flex items-center rounded-md', 'button-group', { passive: passive })"
    ref="groupRef"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    passive?: boolean;
  }>(),
  {
    passive: false,
  }
);
</script>

<style lang="scss" scoped>
.button-group {
  :deep(button) {
    border-radius: 0;
    border-left-width: 1px;
    border-right-width: 0;

    &:first-child {
      border-top-left-radius: 0.375rem; // rounded-md equivalent
      border-bottom-left-radius: 0.375rem;
      border-left-width: 1px;
    }

    &:last-child {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
      border-right-width: 1px;
    }
  }

  &:not(.passive) {
    :deep(button) {
      &:not(:last-child):hover {
        position: relative;
        z-index: 10;

        &::after {
          content: '';
          width: 1px;
          height: calc(100% + 2px);
          background-color: hsl(var(--primary));
          position: absolute;
          top: -1px;
          right: -1px;
        }
      }
    }
  }

  &.passive {
    :deep(button) {
      &:not(.last):hover {
        position: relative;
        z-index: 10;

        &::after {
          content: '';
          width: 1px;
          height: calc(100% + 2px);
          background-color: hsl(var(--primary));
          position: absolute;
          top: -1px;
          right: -1px;
        }
      }

      &.first {
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
        border-left-width: 1px;
      }

      &.last {
        border-top-right-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
        border-right-width: 1px;
      }
    }
  }
}
</style>
