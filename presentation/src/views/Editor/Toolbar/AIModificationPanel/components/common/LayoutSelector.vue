<template>
  <div class="section-group">
    <div class="section-title">{{ t('panels.aiModification.layout.label') }}</div>
    <div class="layout-row">
      <button
        v-for="layout in layoutTypes"
        :key="layout.value"
        class="layout-btn"
        :class="{ active: currentLayout === layout.value }"
        @click="$emit('layout-select', layout.value)"
        :disabled="isTransforming"
        :title="getLayoutTooltipText(layout.value)"
      >
        <component :is="layout.icon" class="layout-btn-icon" />
        {{ layout.label }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface LayoutType {
  label: string;
  value: string;
  icon: any;
}

interface Props {
  layoutTypes: LayoutType[];
  currentLayout: string;
  isTransforming?: boolean;
  getLayoutTooltip?: (layoutType: string) => string;
}

interface Emits {
  (e: 'layout-select', layoutType: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isTransforming: false,
});

defineEmits<Emits>();

const getLayoutTooltipText = (layoutType: string) => {
  if (props.getLayoutTooltip) {
    return props.getLayoutTooltip(layoutType);
  }
  return t('panels.aiModification.layout.changeTooltip', { layoutType });
};
</script>

<style lang="scss" scoped>
.section-group {
  padding-top: 12px;
  border-top: 1px solid var(--presentation-border);
}

.section-title {
  font-weight: 600;
  font-size: 11px;
  color: var(--presentation-muted-foreground);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layout-row {
  display: flex;
  gap: 6px;
}

.layout-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 2px;
  border: 1px solid var(--presentation-border);
  border-radius: 6px;
  background: var(--presentation-card);
  color: var(--presentation-foreground);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
    background: rgba(0, 0, 0, 0.02);
  }

  &.active {
    border-color: var(--presentation-primary);
    background: rgba(37, 99, 235, 0.06);
    color: var(--presentation-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .layout-btn-icon {
    width: 16px;
    height: 16px;
  }
}
</style>
