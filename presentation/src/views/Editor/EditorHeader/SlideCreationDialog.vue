<template>
  <Modal :visible="visible" :width="800" @closed="handleClose">
    <div class="tw-flex tw-flex-col tw-h-full">
      <!-- Header -->
      <div class="tw-mb-5 tw-pb-4 tw-border-b tw-border-gray-200">
        <div class="tw-text-xl tw-font-semibold tw-text-gray-900">Create New Slide</div>
      </div>

      <!-- Content -->
      <div class="tw-flex-1 tw-overflow-y-auto tw-mb-5">
        <!-- Theme Selection -->
        <div class="tw-mb-8">
          <div class="tw-text-base tw-font-semibold tw-mb-4 tw-text-gray-800">Select Theme</div>
          <div class="tw-grid tw-grid-cols-[repeat(auto-fill,minmax(120px,1fr))] tw-gap-4">
            <div
              v-for="(themeData, themeName) in themes"
              :key="themeName"
              class="tw-cursor-pointer tw-border-2 tw-rounded-lg tw-p-2 tw-transition-all"
              :class="
                selectedTheme === themeName
                  ? 'tw-border-blue-500 tw-bg-blue-50'
                  : 'tw-border-transparent hover:tw-border-gray-300'
              "
              @click="selectedTheme = themeName"
            >
              <div
                class="tw-w-full tw-h-20 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-mb-2 tw-shadow-sm"
                :style="getThemePreviewStyle(themeData)"
              >
                <div class="tw-text-3xl tw-font-bold" :style="{ color: themeData.titleFontColor }">Aa</div>
              </div>
              <div class="tw-text-center tw-text-sm tw-text-gray-600">
                {{ formatThemeName(themeName) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Selection -->
        <div>
          <div class="tw-text-base tw-font-semibold tw-mb-4 tw-text-gray-800">Select Layout</div>
          <div class="tw-grid tw-grid-cols-[repeat(auto-fill,minmax(140px,1fr))] tw-gap-4">
            <div
              v-for="(layoutInfo, layoutKey) in layouts"
              :key="layoutKey"
              class="tw-cursor-pointer tw-border-2 tw-rounded-lg tw-p-3 tw-transition-all tw-text-center"
              :class="
                selectedLayout === layoutKey
                  ? 'tw-border-blue-500 tw-bg-blue-50'
                  : 'tw-border-gray-200 hover:tw-border-gray-400'
              "
              @click="selectedLayout = layoutKey"
            >
              <div
                class="tw-w-full tw-h-20 tw-flex tw-items-center tw-justify-center tw-mb-2 tw-bg-gray-50 tw-rounded"
              >
                <div
                  class="tw-w-[70%] tw-h-[70%] tw-bg-gray-300 tw-rounded-sm"
                  :class="`layout-${layoutKey}`"
                ></div>
              </div>
              <div class="tw-text-sm tw-text-gray-600">{{ layoutInfo.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="tw-flex tw-justify-end tw-gap-3 tw-pt-4 tw-border-t tw-border-gray-200">
        <Button class="tw-min-w-[80px]" @click="handleClose">Cancel</Button>
        <Button class="tw-min-w-[120px]" type="primary" @click="handleCreate">Create Slide</Button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import Modal from '@/components/Modal.vue';
import Button from '@/components/Button.vue';

const props = defineProps<{
  visible: boolean;
  themes: Record<string, any>;
}>();

const emit = defineEmits<{
  close: [];
  create: [slideType: string, themeName: string];
}>();

const selectedTheme = ref<string>('default');
const selectedLayout = ref<string>('title-with-subtitle');

const layouts = {
  'title-with-subtitle': {
    name: 'Title with Subtitle',
  },
  'title-no-subtitle': {
    name: 'Title Only',
  },
  'two-column-with-image': {
    name: 'Two Column + Image',
  },
  'two-column': {
    name: 'Two Columns',
  },
  'main-image': {
    name: 'Main Image',
  },
  'table-of-contents': {
    name: 'Table of Contents',
  },
  'vertical-list': {
    name: 'Vertical List',
  },
  'horizontal-list': {
    name: 'Horizontal List',
  },
};

const formatThemeName = (name: string): string => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getThemePreviewStyle = (theme: any) => {
  const backgroundColor =
    typeof theme.backgroundColor === 'string'
      ? theme.backgroundColor
      : `linear-gradient(${theme.backgroundColor.rotate}deg, ${theme.backgroundColor.colors[0].color}, ${theme.backgroundColor.colors[1].color})`;

  return {
    background: backgroundColor,
  };
};

const handleClose = () => {
  emit('close');
};

const handleCreate = () => {
  emit('create', selectedLayout.value, selectedTheme.value);
  handleClose();
};
</script>

<style lang="scss" scoped>
/* Layout visual patterns - complex gradients */
.layout-title-with-subtitle {
  background: linear-gradient(
    to bottom,
    #9ca3af 0%,
    #9ca3af 40%,
    transparent 40%,
    transparent 50%,
    #d1d5db 50%,
    #d1d5db 70%,
    transparent 70%
  );
}

.layout-title-no-subtitle {
  background: linear-gradient(to bottom, #9ca3af 0%, #9ca3af 50%, transparent 50%);
}

.layout-two-column-with-image {
  background: linear-gradient(
    to right,
    #9ca3af 0%,
    #9ca3af 50%,
    transparent 50%,
    transparent 55%,
    #d1d5db 55%,
    #d1d5db 100%
  );
}

.layout-two-column {
  background: linear-gradient(
    to right,
    #9ca3af 0%,
    #9ca3af 48%,
    transparent 48%,
    transparent 52%,
    #9ca3af 52%,
    #9ca3af 100%
  );
}

.layout-main-image {
  background: linear-gradient(to bottom, #9ca3af 0%, #9ca3af 80%, transparent 80%);
}

.layout-table-of-contents {
  background: repeating-linear-gradient(to bottom, #9ca3af 0%, #9ca3af 15%, transparent 15%, transparent 20%);
}

.layout-vertical-list {
  background: repeating-linear-gradient(to bottom, #9ca3af 0%, #9ca3af 20%, transparent 20%, transparent 25%);
}

.layout-horizontal-list {
  background: repeating-linear-gradient(to right, #9ca3af 0%, #9ca3af 20%, transparent 20%, transparent 25%);
}
</style>
