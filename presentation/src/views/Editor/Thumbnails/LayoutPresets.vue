<template>
  <div class="layout-presets">
    <div class="preset-grid">
      <div class="preset-item" v-for="preset in presets" :key="preset.id" @click="selectPreset(preset)">
        <div class="preset-thumbnail-wrapper">
          <ThumbnailSlide
            class="preset-thumbnail"
            :slide="previewSlides[preset.id]"
            :size="140"
            v-if="previewSlides[preset.id]"
          />
          <div class="preset-loading" v-else>
            <div class="loading-placeholder" />
          </div>
        </div>
        <div class="preset-name">{{ t(preset.nameKey) }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type { Slide } from '@/types/slides';
import type { LayoutPreset } from '@/configs/layoutPresets';
import { LAYOUT_PRESETS } from '@/configs/layoutPresets';
import { useI18n } from 'vue-i18n';

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';

const { t } = useI18n();

const emit = defineEmits<{
  (event: 'select', payload: LayoutPreset): void;
}>();

const slidesStore = useSlidesStore();
const { theme, viewportSize, viewportRatio } = storeToRefs(slidesStore);

const presets = LAYOUT_PRESETS;
const previewSlides = ref<Record<string, Slide>>({});

const generatePreviews = async () => {
  const { convertToSlide, selectTemplateById, selectFirstTemplate } = await import('@/utils/slideLayout');

  const viewport = {
    width: viewportSize.value,
    height: viewportSize.value * viewportRatio.value,
  };

  const results: Record<string, Slide> = {};

  await Promise.all(
    presets.map(async (preset) => {
      try {
        let template;
        try {
          template = await selectTemplateById(preset.layoutType, preset.preferredTemplateId);
        } catch {
          template = await selectFirstTemplate(preset.layoutType);
        }

        const slide = await convertToSlide(
          JSON.parse(JSON.stringify(preset.schema)),
          viewport,
          theme.value,
          template
        );
        results[preset.id] = slide;
      } catch (e) {
        console.warn(`Failed to generate preview for preset ${preset.id}`, e);
      }
    })
  );

  previewSlides.value = results;
};

const selectPreset = (preset: LayoutPreset) => {
  emit('select', preset);
};

onMounted(() => {
  generatePreviews();
});

watch(
  () => theme.value,
  () => {
    generatePreviews();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.layout-presets {
  width: 480px;
  max-height: 460px;
  overflow: auto;
  user-select: none;
  padding: 4px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.preset-item {
  cursor: pointer;
  text-align: center;

  &:hover .preset-thumbnail-wrapper {
    border-color: var(--presentation-primary);
  }

  &:hover .preset-name {
    color: var(--presentation-primary);
  }
}

.preset-thumbnail-wrapper {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--presentation-radius);
  border: 2px solid var(--presentation-border);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.preset-thumbnail {
  border-radius: var(--presentation-radius);
}

.preset-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: var(--presentation-radius);
}

.loading-placeholder {
  width: 24px;
  height: 24px;
  border: 2px solid var(--presentation-border);
  border-top-color: var(--presentation-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preset-name {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #666;
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
