<template>
  <Modal :visible="visible" :width="900" @close="$emit('close')">
    <div class="tw-flex tw-flex-col tw-gap-6 tw-p-2">
      <div class="tw-text-center tw-mb-2">
        <h2 class="tw-m-0 tw-mb-3 tw-text-xl tw-font-bold tw-text-foreground">
          {{ $t('editor.templatePreview.dialog.title') }}
        </h2>
        <p class="tw-m-0 tw-text-sm tw-text-muted-foreground tw-leading-relaxed">
          {{ $t('editor.templatePreview.dialog.intro') }}
        </p>
      </div>

      <!-- Two-column comparison -->
      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5 tw-my-4">
        <!-- Left column: Template Preview Mode -->
        <div class="tw-p-4 tw-rounded-lg tw-bg-card tw-border-2 tw-border-blue-500/20">
          <div class="tw-flex tw-items-center tw-gap-2.5 tw-mb-3">
            <IconSwatchBook class="tw-w-6 tw-h-6 tw-flex-shrink-0" />
            <h3 class="tw-m-0 tw-text-base tw-font-semibold tw-text-foreground">
              {{ $t('editor.templatePreview.dialog.previewMode.title') }}
            </h3>
          </div>
          <div
            class="tw-inline-block tw-px-3 tw-py-1 tw-rounded tw-text-xs tw-font-semibold tw-mb-3 tw-uppercase tw-tracking-wide tw-bg-gradient-to-br tw-from-purple-500/15 tw-to-violet-500/15 tw-text-purple-600"
          >
            {{ $t('editor.templatePreview.dialog.currentMode') }}
          </div>

          <div class="tw-mb-5 last:tw-mb-0">
            <h4
              class="tw-m-0 tw-mb-2.5 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-green-600"
            >
              {{ $t('editor.templatePreview.dialog.canDo') }}
            </h4>
            <ul class="tw-list-none tw-m-0 tw-p-0 tw-flex tw-flex-col tw-gap-2">
              <li
                v-for="(label, key) in previewModeFeatures"
                :key="key"
                class="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-leading-relaxed tw-text-foreground"
              >
                <IconCheck class="tw-w-4 tw-h-4 tw-flex-shrink-0 tw-mt-0.5 tw-text-green-600" />
                <span class="tw-flex-1">{{ label }}</span>
              </li>
            </ul>
          </div>

          <div class="tw-mb-5 last:tw-mb-0">
            <h4
              class="tw-m-0 tw-mb-2.5 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-red-600"
            >
              {{ $t('editor.templatePreview.dialog.cannotDo') }}
            </h4>
            <ul class="tw-list-none tw-m-0 tw-p-0 tw-flex tw-flex-col tw-gap-2">
              <li
                v-for="(label, key) in previewModeLimitations"
                :key="key"
                class="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-leading-relaxed tw-text-muted-foreground tw-opacity-90"
              >
                <IconX class="tw-w-4 tw-h-4 tw-flex-shrink-0 tw-mt-0.5 tw-text-red-600" />
                <span class="tw-flex-1">{{ label }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right column: Normal Editing Mode -->
        <div class="tw-p-4 tw-rounded-lg tw-bg-card tw-border-2 tw-border-blue-600/20">
          <div class="tw-flex tw-items-center tw-gap-2.5 tw-mb-3">
            <IconEdit class="tw-w-6 tw-h-6 tw-flex-shrink-0" />
            <h3 class="tw-m-0 tw-text-base tw-font-semibold tw-text-foreground">
              {{ $t('editor.templatePreview.dialog.editingMode.title') }}
            </h3>
          </div>

          <div class="tw-mb-5 last:tw-mb-0">
            <h4
              class="tw-m-0 tw-mb-2.5 tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-green-600"
            >
              {{ $t('editor.templatePreview.dialog.available') }}
            </h4>
            <ul class="tw-list-none tw-m-0 tw-p-0 tw-flex tw-flex-col tw-gap-2">
              <li
                v-for="(label, key) in editingModeFeatures"
                :key="key"
                class="tw-flex tw-items-start tw-gap-2 tw-text-xs tw-leading-relaxed tw-text-foreground"
              >
                <IconCheck class="tw-w-4 tw-h-4 tw-flex-shrink-0 tw-mt-0.5 tw-text-green-600" />
                <span class="tw-flex-1">{{ label }}</span>
              </li>
            </ul>
          </div>

          <div class="tw-p-3 tw-bg-blue-500/8 tw-border-l-2 tw-border-blue-600 tw-rounded tw-mt-4">
            <p class="tw-m-0 tw-mb-3 tw-text-xs tw-text-foreground tw-leading-relaxed">
              {{ $t('editor.templatePreview.dialog.howToUnlock') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Close button -->
      <div class="tw-flex tw-justify-center tw-pt-3 tw-border-t tw-border-border">
        <Button @click="$emit('close')">
          {{ $t('ui.actions.close') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/components/Modal.vue';
import Button from '@/components/Button.vue';
import {
  SwatchBook as IconSwatchBook,
  PencilLine as IconEdit,
  Check as IconCheck,
  X as IconX,
} from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

const previewModeFeatures = computed(() => ({
  browseTemplates: t('editor.templatePreview.dialog.previewMode.features.browseTemplates'),
  switchLayouts: t('editor.templatePreview.dialog.previewMode.features.switchLayouts'),
  navigateSlides: t('editor.templatePreview.dialog.previewMode.features.navigateSlides'),
  previewContent: t('editor.templatePreview.dialog.previewMode.features.previewContent'),
  editText: t('editor.templatePreview.dialog.previewMode.limitations.editText'),
}));

const previewModeLimitations = computed(() => ({
  moveElements: t('editor.templatePreview.dialog.previewMode.limitations.moveElements'),
  addContent: t('editor.templatePreview.dialog.previewMode.limitations.addContent'),
  customizeStyles: t('editor.templatePreview.dialog.previewMode.limitations.customizeStyles'),
  deleteContent: t('editor.templatePreview.dialog.previewMode.limitations.deleteContent'),
  slideModification: t('editor.templatePreview.dialog.previewMode.limitations.slideModification'),
}));

const editingModeFeatures = computed(() => ({
  fullEditing: t('editor.templatePreview.dialog.editingMode.features.fullEditing'),
  moveResize: t('editor.templatePreview.dialog.editingMode.features.moveResize'),
  addElements: t('editor.templatePreview.dialog.editingMode.features.addElements'),
  customizeDesign: t('editor.templatePreview.dialog.editingMode.features.customizeDesign'),
  slideEditing: t('editor.templatePreview.dialog.editingMode.features.slideEditing'),
  elementEditing: t('editor.templatePreview.dialog.editingMode.features.elementEditing'),
  aiEditing: t('editor.templatePreview.dialog.editingMode.features.aiEditing'),
  fullToolbar: t('editor.templatePreview.dialog.editingMode.features.fullToolbar'),
  deleteModify: t('editor.templatePreview.dialog.editingMode.features.deleteModify'),
}));
</script>
