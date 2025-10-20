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
      <div class="tw-text-md tw-font-medium tw-text-foreground tw-text-center">
        {{ $t('toolbar.slideTemplate.title') }}
      </div>
      <div class="tw-text-xs tw-text-muted-foreground tw-mb-4 tw-leading-relaxed">
        {{ $t('toolbar.slideTemplate.description') }}
      </div>

      <div v-if="isLoading" class="tw-flex tw-items-center tw-justify-center tw-py-8">
        <div class="tw-text-sm tw-text-muted-foreground">Loading previews...</div>
      </div>

      <div v-else class="tw-grid tw-grid-cols-2 tw-gap-3 tw-mb-4">
        <div
          v-for="preview in templatePreviews"
          :key="preview.template.id"
          class="tw-cursor-pointer tw-border-2 tw-rounded tw-overflow-hidden tw-transition-all tw-duration-200 hover:tw-border-primary hover:tw--translate-y-0.5 hover:tw-shadow-lg"
          :class="{
            'tw-border-primary tw-shadow-lg': preview.template.id === currentTemplateId,
            'tw-border-border': preview.template.id !== currentTemplateId,
          }"
          @click="handleTemplateClick(preview.template.id)"
        >
          <div class="tw-bg-gray-100 tw-aspect-video tw-relative tw-overflow-hidden">
            <ThumbnailSlide v-if="preview.slide" :slide="preview.slide" size="auto" />
          </div>
          <div class="tw-flex tw-items-center tw-justify-between tw-px-2 tw-py-1.5 tw-bg-background">
            <div class="tw-text-xs tw-font-medium tw-text-foreground">
              {{ preview.template.name }}
            </div>
            <div
              v-if="preview.template.id === currentTemplateId"
              class="tw-text-xs tw-px-1.5 tw-py-0.5 tw-bg-primary tw-text-white tw-rounded tw-flex-shrink-0"
            >
              {{ $t('toolbar.slideTemplate.active') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Template Parameter Editor -->
      <div v-if="currentParameters.length > 0" class="tw-mb-4">
        <TemplateParameterEditor
          :parameters="currentParameters"
          :current-values="currentParameterValues"
          @update="handleParameterUpdate"
        />
      </div>

      <!-- Confirm Template Button (only shown in preview mode) -->
      <div
        v-if="isInPreviewMode"
        class="tw-p-3 tw-border-t tw-border-gray-200 tw-bg-white tw-z-10"
        style="width: inherit"
      >
        <Button
          type="primary"
          class="tw-w-full hover:tw-opacity-90 tw-transition-all"
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
        </Button>
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
import type { Slide, PPTImageElement } from '@/types/slides';
import { ToolbarStates } from '@/types/toolbar';
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import TemplateParameterEditor from './TemplateParameterEditor.vue';
import message from '@/utils/message';
import Button from '@/components/Button.vue';

interface TemplatePreview {
  template: Template;
  slide: Slide | null;
}

const slidesStore = useSlidesStore();
const mainStore = useMainStore();
const { currentSlide, theme, viewportSize, viewportRatio } = storeToRefs(slidesStore);

const { getAvailableTemplates, switchTemplate, updateTemplateParameters, canSwitchTemplate } =
  useSwitchTemplate();
const { isCurrentSlideLocked, confirmCurrentTemplate } = useSlideEditLock();

const templatePreviews = ref<TemplatePreview[]>([]);
const isLoading = ref(false);

const canSwitch = computed(() => {
  return currentSlide.value?.id ? canSwitchTemplate(currentSlide.value.id) : false;
});

const currentTemplateId = computed(() => currentSlide.value?.layout?.templateId || '');

const isInPreviewMode = computed(() => isCurrentSlideLocked.value);

const currentTemplate = computed(() => {
  if (!currentSlide.value?.id) return null;
  const templates = getAvailableTemplates(currentSlide.value.id);
  return templates.find((t) => t.id === currentTemplateId.value) || null;
});

const currentParameters = computed(() => currentTemplate.value?.parameters || []);

const currentParameterValues = computed(() => currentSlide.value?.layout?.parameterOverrides || {});

const handleTemplateClick = async (templateId: string) => {
  if (!currentSlide.value?.id || templateId === currentTemplateId.value) {
    return;
  }

  await switchTemplate(currentSlide.value.id, templateId);
};

const handleParameterUpdate = async (values: Record<string, number>) => {
  if (!currentSlide.value?.id) return;
  await updateTemplateParameters(currentSlide.value.id, values);
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

    // Preserve current image sources by updating the schema with current element data
    const updatedSchema = { ...currentSlide.value.layout.schema };
    const imageElements = currentSlide.value.elements.filter(
      (el) => el.type === 'image'
    ) as PPTImageElement[];

    // Update schema with current image sources based on layout type
    if (updatedSchema.data && imageElements.length > 0) {
      // For layouts with a single image field
      if ('image' in updatedSchema.data && typeof updatedSchema.data.image === 'string') {
        // Use the first image element's source
        updatedSchema.data = { ...updatedSchema.data, image: imageElements[0].src };
      }
    }

    // Generate preview for each template
    const previews = await Promise.all(
      availableTemplates.map(async (template) => {
        try {
          // Generate slide with this specific template using direct ID selection
          const seed = `template-id:${template.id}`;
          const previewSlide = await convertToSlide(updatedSchema, viewport, theme.value, undefined, seed);

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

// Regenerate previews when images change
watch(
  () =>
    (currentSlide.value?.elements.filter((el) => el.type === 'image') as PPTImageElement[]).map(
      (el) => el.src
    ),
  async (newImages, oldImages) => {
    // Only regenerate if images actually changed and we have previews
    if (
      newImages &&
      oldImages &&
      JSON.stringify(newImages) !== JSON.stringify(oldImages) &&
      canSwitch.value
    ) {
      await generatePreviews();
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.slide-template-panel {
  user-select: none;
}
</style>
