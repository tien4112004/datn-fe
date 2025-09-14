<template>
  <div class="text-style-panel">
    <div class="preset-style-dropdown">
      <div
        class="custom-select"
        @click="toggleDropdown"
        ref="selectRef"
        v-tooltip="$t('styling.elements.text.selectPresetStyle')"
      >
        <div class="selected-item" :style="selectedStyleDisplay?.style">
          {{ selectedStyleDisplay?.label || $t('styling.elements.text.selectStyle') }}
        </div>
        <div class="dropdown-arrow" :class="{ open: isDropdownOpen }">
          <IconDown />
        </div>
      </div>
      <div v-if="isDropdownOpen" class="dropdown-options" ref="dropdownRef">
        <div
          class="preset-style-item"
          v-for="(item, index) in presetStyles"
          :key="item.label"
          :style="item.style"
          @click="selectPresetStyle(index)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <Divider />
    <RichTextBase />
    <Divider />

    <div class="row">
      <div style="width: 40%">{{ $t('styling.elements.text.lineSpacing') }}:</div>
      <Select
        style="width: 60%"
        :value="lineHeight || 1"
        @update:value="(value) => updateLineHeight(value as number)"
        :options="
          lineHeightOptions.map((item) => ({
            label: item + 'x',
            value: item,
          }))
        "
      >
        <template #icon>
          <IconRowHeight />
        </template>
      </Select>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.elements.text.paragraphSpacing') }}:</div>
      <Select
        style="width: 60%"
        :value="paragraphSpace || 0"
        @update:value="(value) => updateParagraphSpace(value as number)"
        :options="
          paragraphSpaceOptions.map((item) => ({
            label: item + 'px',
            value: item,
          }))
        "
      >
        <template #icon>
          <IconVerticalSpacingBetweenItems />
        </template>
      </Select>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.elements.text.wordSpacing') }}:</div>
      <Select
        style="width: 60%"
        :value="wordSpace || 0"
        @update:value="(value) => updateWordSpace(value as number)"
        :options="
          wordSpaceOptions.map((item) => ({
            label: item + 'px',
            value: item,
          }))
        "
      >
        <template #icon>
          <IconFullwidth />
        </template>
      </Select>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.elements.text.textboxFill') }}:</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker :modelValue="fill" @update:modelValue="(value) => updateFill(value)" />
        </template>
        <ColorButton :color="fill" />
      </Popover>
    </div>

    <Divider />
    <ElementOutline />
    <Divider />
    <ElementShadow />
    <Divider />
    <ElementOpacity />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { PPTTextElement } from '@/types/slides';
import emitter, { EmitterEvents, type RichTextAction } from '@/utils/emitter';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';

import ElementOpacity from '../common/ElementOpacity.vue';
import ElementOutline from '../common/ElementOutline.vue';
import ElementShadow from '../common/ElementShadow.vue';
import RichTextBase from '../common/RichTextBase.vue';
import ColorButton from '@/components/ColorButton.vue';
import ColorPicker from '@/components/ColorPicker/index.vue';
import Divider from '@/components/Divider.vue';
import Select from '@/components/Select.vue';
import Popover from '@/components/Popover.vue';

// Note: There is an unknown bug where increasing the height of the text box after bolding text causes incorrect canvas viewport positioning.
// Therefore, when executing preset style commands, place the bold command as early as possible to avoid bolding after increasing font size.
const presetStyles = [
  {
    label: 'Large Title',
    style: {
      fontSize: '26px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '66px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: 'Small Title',
    style: {
      fontSize: '22px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '40px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: 'Body Text',
    style: {
      fontSize: '20px',
    },
    cmd: [{ command: 'clear' }, { command: 'fontsize', value: '20px' }],
  },
  {
    label: 'Body Text [Small]',
    style: {
      fontSize: '18px',
    },
    cmd: [{ command: 'clear' }, { command: 'fontsize', value: '18px' }],
  },
  {
    label: 'Note 1',
    style: {
      fontSize: '16px',
      fontStyle: 'italic',
    },
    cmd: [{ command: 'clear' }, { command: 'fontsize', value: '16px' }, { command: 'em' }],
  },
  {
    label: 'Note 2',
    style: {
      fontSize: '16px',
      textDecoration: 'underline',
    },
    cmd: [{ command: 'clear' }, { command: 'fontsize', value: '16px' }, { command: 'underline' }],
  },
];

const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const { handleElement, handleElementId } = storeToRefs(mainStore);

const { addHistorySnapshot } = useHistorySnapshot();

const updateElement = (props: Partial<PPTTextElement>) => {
  slidesStore.updateElement({ id: handleElementId.value, props });
  addHistorySnapshot();
};

const fill = ref<string>('var(--presentation-foreground)');
const lineHeight = ref<number>();
const wordSpace = ref<number>();
const paragraphSpace = ref<number>();
const isDropdownOpen = ref(false);
const selectedStyleIndex = ref<number | null>(null);
const selectRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();

// Computed property for selected style display
const selectedStyleDisplay = computed(() => {
  if (selectedStyleIndex.value !== null) {
    return presetStyles[selectedStyleIndex.value];
  }
  return null;
});

// Toggle dropdown open/close
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Select a preset style
const selectPresetStyle = (index: number) => {
  const selectedStyle = presetStyles[index];
  if (selectedStyle) {
    emitBatchRichTextCommand(selectedStyle.cmd);
  }
  isDropdownOpen.value = false;
  // Don't keep the selection to allow reapplying the same style
  selectedStyleIndex.value = null;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    selectRef.value &&
    dropdownRef.value &&
    !selectRef.value.contains(event.target as Node) &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(
  handleElement,
  () => {
    if (!handleElement.value || handleElement.value.type !== 'text') return;

    fill.value = handleElement.value.fill || 'var(--presentation-background)';
    lineHeight.value = handleElement.value.lineHeight || 1.5;
    wordSpace.value = handleElement.value.wordSpace || 0;
    paragraphSpace.value =
      handleElement.value.paragraphSpace === undefined ? 5 : handleElement.value.paragraphSpace;
    emitter.emit(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE);
  },
  { deep: true, immediate: true }
);

const lineHeightOptions = [0.9, 1.0, 1.15, 1.2, 1.4, 1.5, 1.8, 2.0, 2.5, 3.0];
const wordSpaceOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10];
const paragraphSpaceOptions = [0, 5, 10, 15, 20, 25, 30, 40, 50, 80];

//  Set line height
const updateLineHeight = (value: number) => {
  updateElement({ lineHeight: value });
};

// Set paragraph spacing
const updateParagraphSpace = (value: number) => {
  updateElement({ paragraphSpace: value });
};

// Set letter spacing
const updateWordSpace = (value: number) => {
  updateElement({ wordSpace: value });
};

// Set text box padding
const updateFill = (value: string) => {
  updateElement({ fill: value });
};

// Send rich text formatting commands (in batch)
const emitBatchRichTextCommand = (action: RichTextAction[]) => {
  emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, { action });
};
</script>

<style lang="scss" scoped>
.text-style-panel {
  user-select: none;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.preset-style-dropdown {
  margin-bottom: 10px;
  position: relative;
}

.custom-select {
  width: 100%;
  height: 32px;
  border: 1px solid var(--presentation-border);
  border-radius: var(--presentation-radius);
  background-color: var(--presentation-background);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover {
    border-color: var(--presentation-primary);
  }
}

.selected-item {
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  padding-right: 32px;
  font-size: 13px;
  @include ellipsis-oneline();
}

.dropdown-arrow {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--presentation-muted-foreground);
  transition: transform 0.2s;

  &.open {
    transform: rotate(180deg);
  }
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--presentation-background);
  border: 1px solid var(--presentation-border);
  border-top: none;
  border-radius: 0 0 var(--presentation-radius) var(--presentation-radius);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.preset-style-item {
  height: 50px;
  border-bottom: solid 1px var(--presentation-border);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 10px;

  &:hover {
    border-color: var(--presentation-primary);
    color: var(--presentation-primary);
    background-color: rgba($color: var(--presentation-primary), $alpha: 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
}
</style>
