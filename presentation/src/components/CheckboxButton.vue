<template>
  <Button
    :variant="checked ? 'default' : 'outline'"
    :disabled="disabled"
    :class="
      cn('tw-transition-colors', {
        'tw-bg-primary tw-text-primary-foreground hover:tw-bg-accent': checked && !disabled,
        'hover:tw-text-primary hover:tw-border-primary': !checked && !disabled,
      })
    "
  >
    <slot></slot>
  </Button>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    checked?: boolean;
    disabled?: boolean;
  }>(),
  {
    checked: false,
    disabled: false,
  }
);
</script>
