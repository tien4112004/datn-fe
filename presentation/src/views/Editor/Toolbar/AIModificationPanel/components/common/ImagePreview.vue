<template>
  <div class="image-preview">
    <img :src="src" :alt="altText" class="preview-img" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  src: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: undefined,
});

// Fallback to translated default if alt is not provided
const altText = computed(() => {
  return props.alt || t('panels.aiModification.imageGeneration.imagePreviewAlt');
});
</script>

<style lang="scss" scoped>
.image-preview {
  border-radius: 6px;
  border: 1px solid var(--presentation-border);
  overflow: hidden;

  .preview-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
}
</style>
