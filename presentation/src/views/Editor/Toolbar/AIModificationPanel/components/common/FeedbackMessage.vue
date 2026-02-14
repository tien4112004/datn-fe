<template>
  <div class="feedback-message" :class="type">
    <slot />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  type: 'info' | 'success' | 'error';
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.feedback-message {
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;

  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  &.info {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
  }
}
</style>
