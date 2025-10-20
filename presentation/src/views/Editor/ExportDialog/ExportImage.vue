<template>
  <div class="export-img-dialog">
    <div class="dialog-content">
      <div class="left-panel">
        <div class="configs">
          <div class="row">
            <div class="title">{{ $t('files.export.image.exportFormat') }}</div>
            <RadioGroup class="config-item" v-model:value="format">
              <RadioButton style="width: 50%" value="jpeg">JPEG</RadioButton>
              <RadioButton style="width: 50%" value="png">PNG</RadioButton>
            </RadioGroup>
          </div>
          <div class="row">
            <div class="title">{{ $t('files.export.common.exportRange') }}</div>
            <RadioGroup class="config-item" v-model:value="rangeType">
              <RadioButton style="width: 33.33%" value="all">{{ $t('files.export.common.all') }}</RadioButton>
              <RadioButton style="width: 33.33%" value="current">{{
                $t('files.export.common.currentPage')
              }}</RadioButton>
              <RadioButton style="width: 33.33%" value="custom">{{
                $t('files.export.common.custom')
              }}</RadioButton>
            </RadioGroup>
          </div>
          <div class="row" v-if="rangeType === 'custom'">
            <div class="title" :data-range="`（${range[0]} ~ ${range[1]}）`">
              {{ $t('files.export.common.customRange', { min: range[0], max: range[1] }) }}
            </div>
            <Slider class="config-item" range :min="1" :max="slides.length" :step="1" v-model:value="range" />
          </div>

          <div class="row">
            <div class="title">{{ $t('files.export.image.imageQuality') }}</div>
            <Slider class="config-item" :min="0" :max="1" :step="0.1" v-model:value="quality" />
          </div>

          <div class="row">
            <div class="title">{{ $t('files.export.image.ignoreOnlineFonts') }}</div>
            <div class="config-item">
              <Switch
                v-model:value="ignoreWebfont"
                v-tooltip="t('files.export.image.ignoreOnlineFontsTooltip')"
              />
            </div>
          </div>
        </div>

        <div class="btns">
          <Button class="btn export" type="primary" @click="expImage()">{{
            $t('files.export.image.exportImage')
          }}</Button>
          <Button class="btn close" @click="emit('close')">{{ $t('files.export.common.close') }}</Button>
        </div>
      </div>

      <div class="right-panel">
        <div class="thumbnails-view">
          <div class="thumbnails" ref="imageThumbnailsRef">
            <ThumbnailSlide
              class="thumbnail"
              v-for="slide in renderSlides"
              :key="slide.id"
              :slide="slide"
              size="auto"
            />
          </div>
        </div>
      </div>
    </div>

    <FullscreenSpin :loading="exporting" :tip="t('files.export.common.exporting')" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import useExport from '@/hooks/useExport';

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import FullscreenSpin from '@/components/FullscreenSpin.vue';
import Switch from '@/components/Switch.vue';
import Slider from '@/components/Slider.vue';
import Button from '@/components/Button.vue';
import RadioButton from '@/components/RadioButton.vue';
import RadioGroup from '@/components/RadioGroup.vue';

const { t } = useI18n();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { slides, currentSlide } = storeToRefs(useSlidesStore());

const imageThumbnailsRef = ref<HTMLElement>();
const rangeType = ref<'all' | 'current' | 'custom'>('all');
const range = ref<[number, number]>([1, slides.value.length]);
const format = ref<'jpeg' | 'png'>('jpeg');
const quality = ref(1);
const ignoreWebfont = ref(true);

const renderSlides = computed(() => {
  if (rangeType.value === 'all') return slides.value;
  if (rangeType.value === 'current') return [currentSlide.value];
  return slides.value.filter((item, index) => {
    const [min, max] = range.value;
    return index >= min - 1 && index <= max - 1;
  });
});

const { exportImage, exporting } = useExport();

const expImage = () => {
  if (!imageThumbnailsRef.value) return;
  exportImage(imageThumbnailsRef.value, format.value, quality.value, ignoreWebfont.value);
};
</script>

<style lang="scss" scoped>
.export-img-dialog {
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
}

.configs {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;

  .row {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 25px;
  }

  .title {
    width: 160px;
    position: relative;
    text-align: left;
  }
  .config-item {
    flex: 1;
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
