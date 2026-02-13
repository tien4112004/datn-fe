<template>
  <div class="context-badge">
    <component :is="contextIcon" class="context-icon" />
    <span class="context-text">{{ contextText }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FileText, Square, Layers, Plus, Type, Image } from 'lucide-vue-next';
import type { CurrentContext } from '@/types/aiModification';

const { t } = useI18n();

interface Props {
  context: CurrentContext;
}

const props = defineProps<Props>();

const contextIcon = computed(() => {
  switch (props.context.type) {
    case 'slide':
      return FileText;
    case 'element':
      // Show specific icon based on element type
      if (props.context.elementType === 'text') return Type;
      if (props.context.elementType === 'image') return Image;
      return Square;
    case 'combined-text':
      return Layers;
    case 'elements':
      return Layers;
    case 'generate':
      return Plus;
    default:
      return FileText;
  }
});

const contextText = computed(() => {
  switch (props.context.type) {
    case 'slide':
      return t('panels.aiModification.context.slide');
    case 'element':
      // Show specific text based on element type
      if (props.context.elementType === 'text') return t('panels.aiModification.context.textElement');
      if (props.context.elementType === 'image') return t('panels.aiModification.context.imageElement');
      return t('panels.aiModification.context.element');
    case 'combined-text':
      return t('panels.aiModification.context.combinedText');
    case 'elements':
      return t('panels.aiModification.context.elements', { count: props.context.count || 0 });
    case 'generate':
      return t('panels.aiModification.context.generate');
    default:
      return '';
  }
});
</script>

<style lang="scss" scoped>
.context-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background-color: var(--presentation-secondary);
  border: 1px solid var(--presentation-border);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--presentation-secondary-foreground);
}

.context-icon {
  width: 14px;
  height: 14px;
  color: var(--presentation-secondary-foreground);
}

.context-text {
  line-height: 1;
}
</style>
