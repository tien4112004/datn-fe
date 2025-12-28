<template>
  <div class="preview-area">
    <!-- Loading State -->
    <div v-if="isLoading" class="preview-state loading">
      <div class="spinner"></div>
      <p class="state-message">{{ t('panels.aiModification.states.processing') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="preview-state error">
      <p class="state-message error-message">{{ error }}</p>
      <Button variant="outline" size="small" @click="$emit('retry')">
        {{ t('panels.aiModification.errors.retry') }}
      </Button>
    </div>

    <!-- Preview Content -->
    <div v-else-if="previewData" class="preview-content">
      <div class="preview-label">Preview:</div>
      <div class="preview-data">
        {{ previewData }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="preview-state empty">
      <p class="state-message">{{ t('panels.aiModification.states.selectAction') }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from '@/components/Button.vue';

interface Props {
  isLoading?: boolean;
  error?: string | null;
  previewData?: unknown;
}

defineProps<Props>();
defineEmits<{
  retry: [];
}>();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.preview-area {
  margin-top: 1rem;
  min-height: 100px;
}

.preview-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  min-height: 100px;

  &.loading {
    gap: 1rem;
  }

  &.error {
    gap: 0.75rem;
  }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--presentation-border);
  border-top-color: var(--presentation-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-message {
  font-size: 0.8125rem;
  color: var(--presentation-muted-foreground);
  margin: 0;

  &.error-message {
    color: var(--presentation-destructive);
  }
}

.preview-content {
  padding: 1rem;
  background-color: var(--presentation-secondary);
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
}

.preview-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--presentation-foreground);
  margin-bottom: 0.5rem;
}

.preview-data {
  font-size: 0.8125rem;
  color: var(--presentation-foreground);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
