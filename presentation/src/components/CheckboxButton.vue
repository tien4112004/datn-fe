<template>
  <Button
    :variant="checked ? 'default' : 'outline'"
    :disabled="disabled"
    :class="
      cn('transition-colors', {
        'bg-primary text-primary-foreground hover:bg-accent': checked && !disabled,
        'hover:text-primary hover:border-primary': !checked && !disabled,
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
