<template>
  <div class="input-group">
    <label v-if="label" class="input-label">{{ label }}</label>
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  label?: string;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .input-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--presentation-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
}
</style>
