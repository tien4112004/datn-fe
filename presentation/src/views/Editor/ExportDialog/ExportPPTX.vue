<template>
  <div class="export-pptx-dialog">
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
      <div class="row">
        <div class="title">{{ $t('files.export.pptx.ignoreAudioVideo') }}</div>
        <div class="config-item">
          <Switch v-model:value="ignoreMedia" v-tooltip="t('files.export.pptx.ignoreAudioVideoTooltip')" />
        </div>
      </div>
      <div class="row">
        <div class="title">{{ $t('files.export.pptx.overwriteDefaultMaster') }}</div>
        <div class="config-item">
          <Switch v-model:value="masterOverwrite" />
        </div>
      </div>

      <div class="tip" v-if="!ignoreMedia">
        {{ $t('files.export.pptx.note') }}
      </div>
    </div>
    <div class="btns">
      <Button
        class="btn export"
        type="primary"
        @click="exportPPTX(selectedSlides, masterOverwrite, ignoreMedia)"
        >{{ $t('files.export.pptx.exportPPTX') }}</Button
      >
      <Button class="btn close" @click="emit('close')">{{ $t('files.export.common.close') }}</Button>
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

const { exportPPTX, exporting } = useExport();

const rangeType = ref<'all' | 'current' | 'custom'>('all');
const range = ref<[number, number]>([1, slides.value.length]);
const masterOverwrite = ref(true);
const ignoreMedia = ref(true);

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
.export-pptx-dialog {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.configs {
  width: 520px;
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
    width: 180px;
    text-align: left;
  }
  .config-item {
    flex: 1;
  }

  .tip {
    font-size: 13px;
    color: #aaaaaa;
    line-height: 1.8;
    margin-top: 10px;
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
