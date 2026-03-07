<template>
  <InputGroup :label="t('panels.aiModification.artStyle.label')">
    <div class="style-grid">
      <button
        v-for="style in artStyleOptions"
        :key="style.value || 'none'"
        class="style-card"
        :class="{ active: modelValue === style.value }"
        @click="$emit('update:modelValue', style.value)"
        :disabled="disabled"
      >
        <div class="style-visual">
          <template v-if="style.value === ''">
            <Ban :size="28" class="none-icon" :class="{ 'none-icon--active': modelValue === style.value }" />
          </template>
          <template v-else-if="style.visual">
            <img :src="style.visual" :alt="style.label" class="style-image" />
          </template>
          <template v-else>
            <div class="style-placeholder" />
          </template>
        </div>
        <span class="style-label">{{ style.label }}</span>
      </button>
    </div>
  </InputGroup>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Ban } from 'lucide-vue-next';
import InputGroup from './InputGroup.vue';

const { t } = useI18n();

interface ArtStyleOption {
  value: string;
  label: string;
  visual?: string;
}

interface Props {
  modelValue: string;
  artStyleOptions: ArtStyleOption[];
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.style-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid var(--presentation-border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--presentation-card);
  padding: 0;
  transition:
    border-color 0.15s,
    transform 0.15s;

  &:hover:not(:disabled) {
    border-color: var(--presentation-primary);
    transform: scale(1.03);
  }

  &.active {
    border-color: var(--presentation-primary);
    background: rgba(37, 99, 235, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.style-visual {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.style-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.style-placeholder {
  width: 100%;
  height: 100%;
  background: var(--presentation-muted, rgba(0, 0, 0, 0.06));
}

.none-icon {
  color: var(--presentation-muted-foreground, rgba(0, 0, 0, 0.4));

  &--active {
    color: var(--presentation-primary);
  }
}

.style-label {
  font-size: 10px;
  font-weight: 500;
  padding: 4px 4px;
  text-align: center;
  color: var(--presentation-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.style-card.active .style-label {
  color: var(--presentation-primary);
  font-weight: 600;
}
</style>
