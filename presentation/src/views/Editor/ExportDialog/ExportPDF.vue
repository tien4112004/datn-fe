<template>
  <div class="export-pdf-dialog">
    <div class="thumbnails-view">
      <div class="thumbnails" ref="pdfThumbnailsRef">
        <ThumbnailSlide class="thumbnail" :slide="currentSlide" :size="1600" v-if="rangeType === 'current'" />
        <template v-else>
          <ThumbnailSlide
            class="thumbnail"
            :class="{ 'break-page': (index + 1) % count === 0 }"
            v-for="(slide, index) in slides"
            :key="slide.id"
            :slide="slide"
            :size="1600"
          />
        </template>
      </div>
    </div>
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
      <Button class="btn export" type="primary" @click="expPDF()">{{
        $t('files.export.pdf.printExportPDF')
      }}</Button>
      <Button class="btn close" @click="emit('close')">{{ $t('files.export.common.close') }}</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { print } from '@/utils/print';

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

const { slides, currentSlide, viewportRatio } = storeToRefs(useSlidesStore());

const pdfThumbnailsRef = ref<HTMLElement>();
const rangeType = ref<'all' | 'current'>('all');
const count = ref(1);
const padding = ref(true);

const expPDF = () => {
  if (!pdfThumbnailsRef.value) return;
  const pageSize = {
    width: 1600,
    height: rangeType.value === 'all' ? 1600 * viewportRatio.value * count.value : 1600 * viewportRatio.value,
    margin: padding.value ? 50 : 0,
  };
  print(pdfThumbnailsRef.value, pageSize);
};
</script>

<style lang="scss" scoped>
.export-pdf-dialog {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.thumbnails-view {
  @include absolute-0();

  &::after {
    content: '';
    background-color: var(--presentation-background);
    @include absolute-0();
  }
}
.thumbnail {
  &.break-page {
    break-after: page;
  }
}
.configs {
  width: 500px;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;

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
