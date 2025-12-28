<template>
  <div
    class="action-card"
    :class="{ active: isActive }"
    @click="$emit('click')"
    :title="t(action.description)"
  >
    <component :is="action.icon" class="action-icon" />
    <div class="action-content">
      <div class="action-name">{{ t(action.name) }}</div>
      <div class="action-description">{{ t(action.description) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { AIAction } from '@/types/aiModification';

interface Props {
  action: AIAction;
  isActive?: boolean;
}

defineProps<Props>();
defineEmits<{
  click: [];
}>();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.action-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--presentation-background);

  &:hover {
    border-color: var(--presentation-primary);
    background-color: var(--presentation-secondary);
  }

  &.active {
    border-color: var(--presentation-primary);
    background-color: rgba(var(--presentation-primary-rgb, 59, 130, 246), 0.05);
    box-shadow: 0 0 0 1px var(--presentation-primary);
  }
}

.action-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--presentation-primary);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--presentation-foreground);
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.action-description {
  font-size: 0.75rem;
  color: var(--presentation-muted-foreground);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
