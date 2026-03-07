<template>
  <InputGroup :label="label ?? t('panels.aiModification.imageGenerationModel.label')">
    <div v-if="isLoading" class="loading-state">
      {{ t('panels.aiModification.imageGeneration.loadingModels') }}
    </div>
    <div v-else class="model-select-wrapper" ref="wrapperRef">
      <button
        type="button"
        class="model-trigger"
        :class="{ open: isOpen, disabled: isProcessing || models.length === 0 }"
        :disabled="isProcessing || models.length === 0"
        @click="isOpen = !isOpen"
      >
        <span class="trigger-content">
          <img
            v-if="providerLogo(selectedModel?.provider)"
            :src="providerLogo(selectedModel?.provider)"
            :alt="selectedModel?.provider"
            class="provider-logo"
          />
          <span class="model-name">{{
            selectedModel?.displayName ||
            selectedModel?.name ||
            t('panels.aiModification.imageGeneration.noModels')
          }}</span>
        </span>
        <ChevronDown :size="14" class="chevron" :class="{ rotated: isOpen }" />
      </button>

      <div v-if="isOpen" class="model-dropdown">
        <button
          v-for="model in models"
          :key="`${model.provider}-${model.name}`"
          type="button"
          class="model-option"
          :class="{ active: model.name === selectedModel?.name }"
          @click="select(model)"
        >
          <img
            v-if="providerLogo(model.provider)"
            :src="providerLogo(model.provider)"
            :alt="model.provider"
            class="provider-logo"
          />
          <span>{{ model.displayName || model.name }}</span>
        </button>
      </div>
    </div>
    <div v-if="models.length === 0 && !isLoading" class="warning-text">
      {{ t('panels.aiModification.imageGeneration.noModels') }}
    </div>
  </InputGroup>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronDown } from 'lucide-vue-next';
import InputGroup from './InputGroup.vue';

const { t } = useI18n();

const PROVIDER_LOGOS: Record<string, string> = {
  openai: '/images/providers/openai.png',
  deepseek: '/images/providers/deepseek.png',
  google: '/images/providers/google.png',
  localai: '/images/providers/localai.png',
  openrouter: '/images/providers/openrouter.png',
};

interface Model {
  name: string;
  provider: string;
  displayName?: string;
}

interface Props {
  modelValue: Model;
  models: Model[];
  isLoading?: boolean;
  isProcessing?: boolean;
  label?: string;
}

interface Emits {
  (e: 'update:modelValue', model: Model): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

const selectedModel = computed(() => props.modelValue);

function providerLogo(provider?: string): string | undefined {
  return provider ? PROVIDER_LOGOS[provider] : undefined;
}

function select(model: Model) {
  emit('update:modelValue', model);
  isOpen.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside));
</script>

<style lang="scss" scoped>
.model-select-wrapper {
  position: relative;
}

.model-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-input);
  color: var(--presentation-foreground);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;

  &:hover:not(.disabled) {
    border-color: var(--presentation-primary);
  }

  &.open {
    border-color: var(--presentation-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.model-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.chevron {
  flex-shrink: 0;
  color: var(--presentation-muted-foreground);
  transition: transform 0.15s;

  &.rotated {
    transform: rotate(180deg);
  }
}

.model-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--presentation-card);
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.model-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  color: var(--presentation-foreground);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover {
    background: var(--presentation-muted, rgba(0, 0, 0, 0.04));
  }

  &.active {
    background: rgba(37, 99, 235, 0.06);
    color: var(--presentation-primary);
    font-weight: 500;
  }
}

.loading-state {
  padding: 8px 12px;
  color: var(--presentation-muted-foreground);
  font-size: 13px;
  font-style: italic;
}

.warning-text {
  margin-top: 4px;
  color: #f59e0b;
  font-size: 12px;
}
</style>
