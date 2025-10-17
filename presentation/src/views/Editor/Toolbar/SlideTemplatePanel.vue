<template>
  <div class="slide-template-panel">
    <template v-if="!canSwitch">
      <div
        class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-8 tw-px-4 tw-text-center tw-text-gray-500"
      >
        <p>{{ $t('toolbar.slideTemplate.noTemplatesAvailable') }}</p>
        <p class="tw-text-xs tw-mt-2 tw-text-gray-400">
          {{ $t('toolbar.slideTemplate.onlyForAIGenerated') }}
        </p>
      </div>
    </template>

    <template v-else>
      <div class="title title-panel">{{ $t('toolbar.slideTemplate.title') }}</div>
      <div class="tw-text-xs tw-text-gray-600 tw-mb-4 tw-leading-relaxed">
        {{ $t('toolbar.slideTemplate.description') }}
      </div>

      <div v-if="isLoading" class="tw-flex tw-items-center tw-justify-center tw-py-8">
        <div class="tw-text-sm tw-text-gray-500">Loading previews...</div>
      </div>

      <div
        v-else
        class="tw-grid tw-grid-cols-2 tw-gap-3"
        :class="{ 'tw-mb-3': !isInPreviewMode, 'tw-pb-20': isInPreviewMode }"
      >
        <div
          v-for="preview in templatePreviews"
          :key="preview.template.id"
          class="tw-cursor-pointer tw-border-2 tw-rounded tw-overflow-hidden tw-transition-all tw-duration-200 hover:tw-border-[var(--presentation-primary)] hover:tw--translate-y-0.5 hover:tw-shadow-lg"
          :class="{
            'tw-border-[var(--presentation-primary)] tw-shadow-[0_0_0_3px_rgba(var(--presentation-primary-rgb),0.2)]':
              preview.template.id === currentTemplateId,
            'tw-border-[var(--presentation-border)]': preview.template.id !== currentTemplateId,
          }"
          @click="handleTemplateClick(preview.template.id)"
        >
          <div class="tw-bg-gray-100 tw-aspect-video tw-relative tw-overflow-hidden">
            <ThumbnailSlide v-if="preview.slide" :slide="preview.slide" size="auto" />
          </div>
          <div
            class="tw-flex tw-items-center tw-justify-between tw-px-2 tw-py-1.5 tw-bg-[var(--presentation-background)]"
          >
            <div class="tw-text-xs tw-font-medium tw-text-[var(--presentation-foreground)]">
              {{ preview.template.name }}
            </div>
            <div
              v-if="preview.template.id === currentTemplateId"
              class="tw-text-[10px] tw-px-1.5 tw-py-0.5 tw-bg-[var(--presentation-primary)] tw-text-white tw-rounded tw-flex-shrink-0"
            >
              {{ $t('toolbar.slideTemplate.active') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Template Button (only shown in preview mode) -->
      <div
        v-if="isInPreviewMode"
        class="tw-p-3 tw-border-t tw-border-gray-200 tw-bg-white tw-z-10"
        style="width: inherit"
      >
        <button
          class="tw-w-full tw-py-2.5 tw-px-4 tw-bg-[var(--presentation-primary)] tw-text-white tw-rounded tw-font-medium tw-text-sm tw-transition-all hover:tw-opacity-90 tw-flex tw-items-center tw-justify-center tw-gap-2"
          @click="confirmAndStartEditing"
        >
          <svg
            class="tw-w-4 tw-h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {{ $t('toolbar.slideTemplate.confirmButton') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { useMainStore } from '@/store';
import useSwitchTemplate from '@/hooks/useSwitchTemplate';
import useSlideEditLock from '@/hooks/useSlideEditLock';
import { convertToSlide } from '@/utils/slideLayout';
import type { Template } from '@/utils/slideLayout/types';
import type { Slide } from '@/types/slides';
import { ToolbarStates } from '@/types/toolbar';
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import message from '@/utils/message';

interface TemplatePreview {
  template: Template;
  slide: Slide | null;
}

const slidesStore = useSlidesStore();
const mainStore = useMainStore();
const { currentSlide, theme, viewportSize, viewportRatio } = storeToRefs(slidesStore);

const { getAvailableTemplates, switchTemplate, canSwitchTemplate } = useSwitchTemplate();
const { isCurrentSlideLocked, confirmCurrentTemplate } = useSlideEditLock();

const templatePreviews = ref<TemplatePreview[]>([]);
const isLoading = ref(false);

const canSwitch = computed(() => {
  return currentSlide.value?.id ? canSwitchTemplate(currentSlide.value.id) : false;
});

const currentTemplateId = computed(() => currentSlide.value?.layout?.templateId || '');

const isInPreviewMode = computed(() => isCurrentSlideLocked.value);

const handleTemplateClick = async (templateId: string) => {
  if (!currentSlide.value?.id || templateId === currentTemplateId.value) {
    return;
  }

  await switchTemplate(currentSlide.value.id, templateId);
};

const confirmAndStartEditing = () => {
  if (!currentSlide.value?.id) return;

  confirmCurrentTemplate();

  // Switch back to design panel (template tab will be hidden automatically)
  mainStore.setToolbarState(ToolbarStates.SLIDE_DESIGN);

  // Show success message
  message.success('Template confirmed! You can now edit your slide.');
};

/**
 * Generate preview slides for all available templates
 */
const generatePreviews = async () => {
  if (!currentSlide.value?.layout?.schema || isLoading.value) {
    return;
  }

  isLoading.value = true;
  templatePreviews.value = [];

  try {
    const availableTemplates = getAvailableTemplates(currentSlide.value.id);
    const viewport = {
      width: viewportSize.value,
      height: viewportSize.value * viewportRatio.value,
    };

    // Generate preview for each template
    const previews = await Promise.all(
      availableTemplates.map(async (template) => {
        try {
          // Generate slide with this specific template using direct ID selection
          const seed = `template-id:${template.id}`;
          const previewSlide = await convertToSlide(
            currentSlide.value!.layout!.schema,
            viewport,
            theme.value,
            undefined,
            seed
          );

          return {
            template,
            slide: previewSlide,
          };
        } catch (error) {
          console.error(`Error generating preview for template ${template.id}:`, error);
          return {
            template,
            slide: null,
          };
        }
      })
    );

    templatePreviews.value = previews;
  } finally {
    isLoading.value = false;
  }
};

// Regenerate previews when slide changes
watch(
  () => currentSlide.value?.id,
  async (newId) => {
    if (!newId || !canSwitch.value) {
      templatePreviews.value = [];
      return;
    }

    await generatePreviews();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.slide-template-panel {
  user-select: none;
}
</style>
