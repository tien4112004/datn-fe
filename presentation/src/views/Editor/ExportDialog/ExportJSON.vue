<template>
  <div class="export-json-dialog">
    <div class="preview">
      <pre>{{ json }}</pre>
    </div>

    <div class="btns">
      <Button class="btn export" type="primary" @click="exportJSON()">{{
        $t('files.export.json.exportJSON')
      }}</Button>
      <Button class="btn close" @click="emit('close')">{{ $t('files.export.common.close') }}</Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import useExport from '@/hooks/useExport';
import Button from '@/components/Button.vue';

const { t } = useI18n();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { slides, viewportRatio, title, viewportSize, theme } = storeToRefs(useSlidesStore());
const { exportJSON } = useExport();

const json = computed(() => {
  return {
    title: title.value,
    width: viewportSize.value,
    height: viewportSize.value * viewportRatio.value,
    theme: theme.value,
    slides: slides.value,
  };
});
</script>

<style lang="scss" scoped>
.export-json-dialog {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.preview {
  width: 100%;
  height: calc(100% - 100px);
  background-color: $gray-f9f9f9;
  color: #0451a5;
  overflow: auto;
}
pre {
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
.btns {
  width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;

  .export {
    flex: 1;
  }
  .close {
    width: 100px;
    margin-left: 10px;
  }
}
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #e1e1e1;
  border-radius: 5px;
}
</style>
