<template>
  <Button
    :variant="checked ? 'default' : 'outline'"
    :disabled="disabled"
    :class="
      cn('transition-colors', {
        'bg-primary text-primary-foreground hover:bg-primary/90': checked && !disabled,
        'hover:text-primary border-input hover:border-primary': !checked && !disabled,
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
