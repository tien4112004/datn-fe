<template>
  <div class="quick-actions-row">
    <button
      v-for="action in actions"
      :key="action.label"
      class="chip-button"
      @click="$emit('action-click', action)"
      :disabled="disabled"
    >
      <component :is="action.icon" class="chip-icon" />
      {{ action.label }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { QuickAction } from '../../composables/useQuickActions';

interface Props {
  actions: QuickAction[];
  disabled?: boolean;
}

interface Emits {
  (e: 'action-click', action: QuickAction): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.quick-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--presentation-border);
  background: var(--presentation-card);
  color: var(--presentation-foreground);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chip-icon {
    width: 13px;
    height: 13px;
  }
}
</style>
