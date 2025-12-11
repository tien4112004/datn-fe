<template>
  <div
    v-if="isGenerating"
    class="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-bg-gray-100/80 tw-backdrop-blur-[4px]"
  >
    <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-[200px] tw-h-[200px]">
      <div
        class="tw-w-9 tw-h-9 tw-border-4 tw-border-blue-600 tw-border-t-transparent tw-rounded-full tw-animate-spin"
      ></div>
      <div class="tw-mt-5 tw-text-blue-600 tw-font-medium tw-text-center">{{ message }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useGenerationStore } from '@/store/generation';
import { useI18n } from 'vue-i18n';

const generationStore = useGenerationStore();
const { t } = useI18n();

const isGenerating = computed(() => generationStore.isStreaming);

const message = computed(() => {
  return t('glossary.loading.generatingPresentation') || 'Generating presentation...';
});
</script>
