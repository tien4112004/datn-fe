<template>
  <div class="export-pptist-dialog">
    <div class="configs">
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
      <div class="tip">
        {{ $t('files.export.pptist.pptistTip') }}
      </div>
    </div>
    <div class="btns">
      <Button class="btn export" type="primary" @click="exportSpecificFile(selectedSlides)">
        {{ $t('files.export.pptist.exportPptistFile') }}
      </Button>
      <Button class="btn close" @click="emit('close')">
        {{ $t('files.export.common.close') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import useExport from '@/hooks/useExport';

import Slider from '@/components/Slider.vue';
import Button from '@/components/Button.vue';
import RadioButton from '@/components/RadioButton.vue';
import RadioGroup from '@/components/RadioGroup.vue';

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { slides, currentSlide } = storeToRefs(useSlidesStore());

const { exportSpecificFile } = useExport();

const rangeType = ref<'all' | 'current' | 'custom'>('all');
const range = ref<[number, number]>([1, slides.value.length]);

const selectedSlides = computed(() => {
  if (rangeType.value === 'all') return slides.value;
  if (rangeType.value === 'current') return [currentSlide.value];
  return slides.value.filter((item, index) => {
    const [min, max] = range.value;
    return index >= min - 1 && index <= max - 1;
  });
});
</script>

<style lang="scss" scoped>
.export-pptist-dialog {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.configs {
  width: 500px;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;

  .row {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 25px;
  }

  .title {
    width: 140px;
  }
  .config-item {
    flex: 1;
  }

  .tip {
    font-size: $smTextSize;
    color: $gray-aaa;
    line-height: 1.8;
    margin-top: 25px;
  }
}
.btns {
  display: flex;
  justify-content: center;
  align-items: center;

  .export {
    width: 140px;
  }
  .close {
    width: 140px;
    margin-left: 10px;
  }
}
</style>
