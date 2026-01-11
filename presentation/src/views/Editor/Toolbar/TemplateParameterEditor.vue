<template>
  <div v-if="hasParameters" class="template-parameter-editor tw-w-full tw-max-w-full tw-overflow-hidden">
    <div
      class="title-panel tw-font-medium tw-text-muted-foreground tw-mb-3 tw-pb-2 tw-border-b tw-border-gray-200"
    >
      {{ $t('toolbar.slideTemplate.customizeParameters') }}
    </div>

    <div class="tw-space-y-4 tw-min-w-0">
      <div v-for="param in parameters" :key="param.key" class="parameter-control tw-w-full tw-min-w-0">
        <!-- Boolean Parameter -->
        <div v-if="param.type === 'boolean'" class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex-1">
            <label class="tw-text-xs tw-font-medium tw-text-muted-foreground">
              {{ getParameterLabel(param) }}
            </label>
            <p
              v-if="getParameterDescription(param)"
              class="tw-text-xs tw-text-gray-400 tw-mt-1 tw-leading-tight"
            >
              {{ getParameterDescription(param) }}
            </p>
          </div>
          <input
            type="checkbox"
            :checked="Boolean(localValues[param.key])"
            @change="(e) => handleParameterChange(param.key, (e.target as HTMLInputElement).checked)"
            class="tw-w-4 tw-h-4 tw-rounded tw-border-gray-300 tw-text-blue-600 focus:tw-ring-blue-500"
          />
        </div>

        <!-- Number Parameter -->
        <div v-else>
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
            <label class="tw-text-xs tw-font-medium tw-text-muted-foreground">
              {{ getParameterLabel(param) }}
            </label>
            <span class="tw-text-xs tw-text-muted-foreground tw-font-mono">
              {{ formatValue(param, localValues[param.key]) }}
            </span>
          </div>

          <Slider
            :value="Number(localValues[param.key])"
            :min="param.min ?? 0"
            :max="param.max ?? 100"
            :step="param.step ?? 1"
            @update:value="(value) => handleParameterChange(param.key, value as any)"
            class="tw-w-full tw-max-w-full"
          />

          <p
            v-if="getParameterDescription(param)"
            class="tw-text-xs tw-text-gray-400 tw-mt-1 tw-leading-tight"
          >
            {{ getParameterDescription(param) }}
          </p>
        </div>
      </div>
    </div>

    <Button
      v-if="hasChanges"
      @click="resetToDefaults"
      class="tw-mt-4 tw-w-full tw-py-2 tw-px-3 tw-text-xs tw-text-gray-600"
    >
      {{ $t('toolbar.slideTemplate.resetToDefaults') }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import type { TemplateParameter } from '@/utils/slideLayout/types';
import { debounce } from 'lodash';
import Slider from '@/components/Slider.vue';
import Button from '@/components/Button.vue';
import { useParameterLocalization } from '@/composables/useParameterLocalization';

interface Props {
  parameters?: TemplateParameter[];
  currentValues?: Record<string, number | boolean>;
}

interface Emits {
  (e: 'update', values: Record<string, number | boolean>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Initialize localization composable
const { getParameterLabel, getParameterDescription, formatValue } = useParameterLocalization();

const localValues = ref<Record<string, number | boolean>>({});

const hasParameters = computed(() => props.parameters && props.parameters.length > 0);

const hasChanges = computed(() => {
  if (!props.parameters) return false;
  return props.parameters.some((param) => {
    const currentValue = localValues.value[param.key];
    return currentValue !== param.defaultValue;
  });
});

/**
 * Initialize local values from props
 */
const initializeValues = () => {
  if (!props.parameters) return;

  const values: Record<string, number | boolean> = {};
  for (const param of props.parameters) {
    values[param.key] = props.currentValues?.[param.key] ?? param.defaultValue;
  }
  localValues.value = values;
};

/**
 * Debounced parameter update to avoid excessive re-renders
 */
const debouncedUpdate = debounce((values: Record<string, number | boolean>) => {
  emit('update', values);
}, 100);

/**
 * Handle parameter value change
 */
const handleParameterChange = (key: string, value: number | boolean) => {
  localValues.value = {
    ...localValues.value,
    [key]: value,
  };

  debouncedUpdate(localValues.value);
};

/**
 * Reset all parameters to their default values
 */
const resetToDefaults = () => {
  if (!props.parameters) return;

  const defaults: Record<string, number | boolean> = {};
  for (const param of props.parameters) {
    defaults[param.key] = param.defaultValue;
  }

  localValues.value = defaults;
  emit('update', defaults);
};

// Watch for external parameter changes
watch(
  () => props.parameters,
  () => {
    initializeValues();
  },
  { immediate: true }
);

// Watch for external value changes
watch(
  () => props.currentValues,
  () => {
    initializeValues();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.template-parameter-editor {
  user-select: none;
}
</style>
