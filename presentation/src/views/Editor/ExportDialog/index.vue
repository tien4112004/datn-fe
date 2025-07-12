<template>
  <div class="export-dialog">
    <Tabs
      :tabs="tabs"
      :value="dialogForExport"
      card
      @update:value="(key) => setDialogForExport(key as DialogForExportTypes)"
    />
    <div class="content">
      <component :is="currentDialogComponent" @close="setDialogForExport('')"></component>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import type { DialogForExportTypes } from '@/types/export';

import ExportImage from './ExportImage.vue';
import ExportJSON from './ExportJSON.vue';
import ExportPDF from './ExportPDF.vue';
import ExportPPTX from './ExportPPTX.vue';
import ExportSpecificFile from './ExportSpecificFile.vue';
import Tabs from '@/components/Tabs.vue';

interface TabItem {
  key: DialogForExportTypes;
  label: string;
}

const mainStore = useMainStore();
const { dialogForExport } = storeToRefs(mainStore);

const setDialogForExport = mainStore.setDialogForExport;

const tabs: TabItem[] = [
  { key: 'pptist', label: 'Export PPTist File' },
  { key: 'pptx', label: 'Export PPTX' },
  { key: 'image', label: 'Export Image' },
  { key: 'json', label: 'Export JSON' },
  { key: 'pdf', label: 'Print / Export PDF' },
];

const currentDialogComponent = computed<unknown>(() => {
  const dialogMap = {
    image: ExportImage,
    json: ExportJSON,
    pdf: ExportPDF,
    pptx: ExportPPTX,
    pptist: ExportSpecificFile,
  };
  if (dialogForExport.value) return dialogMap[dialogForExport.value] || null;
  return null;
});
</script>

<style lang="scss" scoped>
.export-dialog {
  margin: -20px;
  border-radius: $cardBorderRadius;
  padding: $extraLargeSpacing;
}
.content {
  height: 460px;
  padding: 12px;
  font-size: $baseTextSize;

  @include overflow-overlay();
}
</style>
