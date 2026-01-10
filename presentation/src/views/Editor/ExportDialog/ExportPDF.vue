<template>
  <div class="export-pdf-dialog">
    <div class="dialog-content">
      <div class="left-panel">
        <div class="configs">
          <div class="row">
            <div class="title">{{ $t('files.export.common.exportRange') }}</div>
            <RadioGroup class="config-item" v-model:value="rangeType">
              <RadioButton style="width: 50%" value="all">{{ $t('files.export.common.all') }}</RadioButton>
              <RadioButton style="width: 50%" value="current">{{
                $t('files.export.common.currentPage')
              }}</RadioButton>
            </RadioGroup>
          </div>
          <div class="row">
            <div class="title">{{ $t('files.export.pdf.perPageCount') }}</div>
            <Select
              class="config-item"
              v-model:value="count"
              :options="[
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
              ]"
            />
          </div>
          <div class="row">
            <div class="title">{{ $t('files.export.pdf.edgePadding') }}</div>
            <div class="config-item">
              <Switch v-model:value="padding" />
            </div>
          </div>
          <div class="tip">
            {{ $t('files.export.pdf.tip') }}
          </div>
        </div>

        <div class="btns">
          <Button class="btn export" type="primary" @click="expPDF()" :disabled="isExporting">{{
            isExporting ? $t('files.export.common.exporting') : $t('files.export.pdf.printExportPDF')
          }}</Button>
          <Button class="btn close" @click="emit('close')" :disabled="isExporting">{{
            $t('files.export.common.close')
          }}</Button>
        </div>
      </div>

      <div class="right-panel">
        <div class="thumbnails-view">
          <div class="thumbnails" ref="pdfThumbnailsRef">
            <ThumbnailSlide
              class="thumbnail"
              :slide="currentSlide"
              size="auto"
              v-if="rangeType === 'current'"
            />
            <template v-else>
              <ThumbnailSlide
                class="thumbnail"
                :class="{ 'break-page': (index + 1) % count === 0 }"
                v-for="(slide, index) in slides"
                :key="slide.id"
                :slide="slide"
                size="auto"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { exportSlidesToPDF, captureElementAsImage } from '@/utils/pdfExport';

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import Switch from '@/components/Switch.vue';
import Button from '@/components/Button.vue';
import RadioButton from '@/components/RadioButton.vue';
import RadioGroup from '@/components/RadioGroup.vue';
import Select from '@/components/Select.vue';

const { t } = useI18n();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { slides, currentSlide, viewportRatio, viewportSize } = storeToRefs(useSlidesStore());

const pdfThumbnailsRef = ref<HTMLElement>();
const rangeType = ref<'all' | 'current'>('all');
const count = ref(1);
const padding = ref(true);
const isExporting = ref(false);
const previewImages = ref<string[]>([]);
const isGeneratingPreview = ref(false);

const expPDF = async () => {
  if (!pdfThumbnailsRef.value) return;

  isExporting.value = true;

  try {
    // Wait for next tick to ensure all thumbnails are rendered
    await nextTick();

    // Additional delay to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Get all thumbnail slide elements
    const thumbnailElements = pdfThumbnailsRef.value.querySelectorAll('.thumbnail');

    if (thumbnailElements.length === 0) {
      console.error('No slide thumbnails found');
      return;
    }

    // Extract the actual .elements div from each thumbnail (the actual slide content)
    const slideElements: HTMLElement[] = [];
    thumbnailElements.forEach((thumbnail) => {
      const elementsDiv = thumbnail.querySelector('.elements') as HTMLElement;
      if (elementsDiv) {
        slideElements.push(elementsDiv);
      }
    });

    if (slideElements.length === 0) {
      console.error('No slide content elements found');
      return;
    }

    // For single slide per page: each slide should fill the entire page
    const slideWidth = 1600;
    const slideHeight = 1600 * viewportRatio.value;

    const pageSize = {
      width: slideWidth,
      height: slideHeight,
      margin: padding.value ? 50 : 0,
    };

    // Render size for high quality capture
    const renderSize = {
      width: slideWidth,
      height: slideHeight,
    };

    // Calculate scale factor to upscale from natural size (viewportSize) to target size (1600)
    const scaleFactor = 1600 / viewportSize.value;

    // Export slides to PDF (one slide per page for now)
    await exportSlidesToPDF(slideElements, pageSize, renderSize, 1, scaleFactor);
  } catch (error) {
    console.error('PDF export failed:', error);
  } finally {
    isExporting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.export-pdf-dialog {
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

.dialog-content {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 20px;
}

.left-panel {
  flex: 0 0 auto;
  width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 20px 40px 40px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 40px 40px 20px;
  min-width: 0;
}

.thumbnails-view {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--presentation-background);
  border-radius: 8px;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  }
}

.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.thumbnail {
  width: 100%;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;

  &.break-page {
    break-after: page;
  }
}

.configs {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;

  .row {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
  }

  .title {
    width: 140px;
    text-align: left;
  }
  .config-item {
    flex: 1;
  }

  .tip {
    font-size: 13px;
    color: #aaaaaa;
    line-height: 1.8;
    margin-top: 25px;
  }
}

.btns {
  display: flex;
  justify-content: center;
  align-items: center;

  .export {
    width: 120px;
  }
  .close {
    width: 120px;
    margin-left: 10px;
  }
}
</style>
