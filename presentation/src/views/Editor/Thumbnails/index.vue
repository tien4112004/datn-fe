<template>
  <Card
    class="thumbnails"
    @mousedown="() => setThumbnailsFocus(true)"
    v-click-outside="() => setThumbnailsFocus(false)"
    v-contextmenu="contextmenusThumbnails"
    padding="normal"
  >
    <div class="add-slide">
      <div class="btn center" @click="createSlide()">
        <IconPlus class="icon" />{{ $t('thumbnails.slides.addSlide') }}
      </div>
      <Divider type="vertical" :margin="0" />
      <Popover trigger="click" placement="bottom-start" v-model:value="presetLayoutPopoverVisible" center>
        <template #content>
          <Templates
            @select="
              (slide) => {
                createSlideByTemplate(slide);
                presetLayoutPopoverVisible = false;
              }
            "
            @selectAll="
              (slides) => {
                insertAllTemplates(slides);
                presetLayoutPopoverVisible = false;
              }
            "
          />
        </template>
        <div class="select-btn"><IconDown /></div>
      </Popover>
    </div>

    <Draggable
      class="thumbnail-list"
      ref="thumbnailsRef"
      :modelValue="slides"
      :animation="200"
      :scroll="true"
      :scrollSensitivity="50"
      :disabled="editingSectionId"
      @end="handleDragEnd"
      itemKey="id"
    >
      <template #item="{ element, index }">
        <div class="thumbnail-container">
          <div
            class="section-title"
            :data-section-id="element?.sectionTag?.id || ''"
            v-if="element.sectionTag || (hasSection && index === 0)"
            v-contextmenu="contextmenusSection"
          >
            <input
              :id="`section-title-input-${element?.sectionTag?.id || 'default'}`"
              type="text"
              :value="element?.sectionTag?.title || ''"
              :placeholder="$t('thumbnails.sections.enterSectionName')"
              @blur="($event) => saveSection($event)"
              @keydown.enter.stop="($event) => saveSection($event)"
              v-if="
                editingSectionId === element?.sectionTag?.id ||
                (index === 0 && editingSectionId === 'default')
              "
            />
            <span class="text" v-else>
              <div class="text-content">
                {{
                  element?.sectionTag
                    ? element?.sectionTag?.title || $t('thumbnails.sections.untitledSection')
                    : $t('thumbnails.sections.defaultSection')
                }}
              </div>
            </span>
          </div>
          <div
            class="thumbnail-item center"
            :class="{
              active: slideIndex === index,
              selected: selectedSlidesIndex.includes(index),
            }"
            @mousedown="($event) => handleClickSlideThumbnail($event, index)"
            @dblclick="enterScreening()"
            v-contextmenu="contextmenusThumbnailItem"
          >
            <div class="label" :class="{ 'offset-left': index >= 99 }">
              {{ fillDigit(index + 1, 2) }}
            </div>
            <ThumbnailSlide
              class="thumbnail"
              :slide="element"
              :size="120"
              :visible="index < slidesLoadLimit"
            />

            <div class="note-flag" v-if="element.notes && element.notes.length" @click="openNotesPanel()">
              {{ element.notes.length }}
            </div>
          </div>
        </div>
      </template>
    </Draggable>

    <div class="page-number">
      {{ $t('thumbnails.slides.slide') }} {{ slideIndex + 1 }}/{{ slides.length }}
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store';
import { fillDigit } from '@/utils/common';
import { isElementInViewport } from '@/utils/element';
import type { ContextmenuItem } from '@/components/Contextmenu/types';
import useSlideHandler from '@/hooks/useSlideHandler';
import useSectionHandler from '@/hooks/useSectionHandler';
import useScreening from '@/hooks/useScreening';
import useLoadSlides from '@/hooks/useLoadSlides';
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements';
import type { Slide } from '@/types/slides';

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue';
import Templates from './Templates.vue';
import Popover from '@/components/Popover.vue';
import Draggable from 'vuedraggable';
import Divider from '@/components/Divider.vue';
import Card from '@/components/Card.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const mainStore = useMainStore();
const slidesStore = useSlidesStore();
const keyboardStore = useKeyboardStore();
const { selectedSlidesIndex: _selectedSlidesIndex, thumbnailsFocus } = storeToRefs(mainStore);
const { slides, slideIndex, currentSlide } = storeToRefs(slidesStore);
const { ctrlKeyState, shiftKeyState } = storeToRefs(keyboardStore);

const { slidesLoadLimit } = useLoadSlides();

const selectedSlidesIndex = computed(() => [..._selectedSlidesIndex.value, slideIndex.value]);

const presetLayoutPopoverVisible = ref(false);

const hasSection = computed(() => {
  return slides.value.some((item) => item.sectionTag);
});

const { addSlidesFromData } = useAddSlidesOrElements();

const {
  copySlide,
  pasteSlide,
  createSlide,
  createSlideByTemplate,
  copyAndPasteSlide,
  deleteSlide,
  cutSlide,
  selectAllSlide,
  sortSlides,
  isEmptySlide,
} = useSlideHandler();

const { createSection, removeSection, removeAllSection, removeSectionSlides, updateSectionTitle } =
  useSectionHandler();

// When the page is switched
const thumbnailsRef = ref<InstanceType<typeof Draggable>>();
watch(
  () => slideIndex.value,
  () => {
    // Clear multi-selected slides
    if (selectedSlidesIndex.value.length) {
      mainStore.updateSelectedSlidesIndex([]);
    }

    // Check if the current page thumbnail is in the visible area, if not, scroll to the corresponding position
    nextTick(() => {
      const activeThumbnailRef: HTMLElement =
        thumbnailsRef.value?.$el?.querySelector('.thumbnail-item.active');
      if (
        thumbnailsRef.value &&
        activeThumbnailRef &&
        !isElementInViewport(activeThumbnailRef, thumbnailsRef.value.$el)
      ) {
        setTimeout(() => {
          activeThumbnailRef.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  },
  { immediate: true }
);

// Switch page
const changeSlideIndex = (index: number) => {
  mainStore.setActiveElementIdList([]);

  if (slideIndex.value === index) return;
  slidesStore.updateSlideIndex(index);
};

// Click thumbnail
const handleClickSlideThumbnail = (e: MouseEvent, index: number) => {
  if (editingSectionId.value) return;

  const isMultiSelected = selectedSlidesIndex.value.length > 1;

  if (isMultiSelected && selectedSlidesIndex.value.includes(index) && e.button !== 0) return;

  // Hold Ctrl key, click to select slides, click again on selected page to deselect
  // If the deselected page happens to be the current active page, select the first from other selected pages as the current active page
  if (ctrlKeyState.value) {
    if (slideIndex.value === index) {
      if (!isMultiSelected) return;

      const newSelectedSlidesIndex = selectedSlidesIndex.value.filter((item) => item !== index);
      mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex);
      changeSlideIndex(selectedSlidesIndex.value[0]);
    } else {
      if (selectedSlidesIndex.value.includes(index)) {
        const newSelectedSlidesIndex = selectedSlidesIndex.value.filter((item) => item !== index);
        mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex);
      } else {
        const newSelectedSlidesIndex = [...selectedSlidesIndex.value, index];
        mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex);
      }
    }
  }
  // Hold Shift key, select all slides in the range
  else if (shiftKeyState.value) {
    if (slideIndex.value === index && !isMultiSelected) return;

    let minIndex = Math.min(...selectedSlidesIndex.value);
    let maxIndex = index;

    if (index < minIndex) {
      maxIndex = Math.max(...selectedSlidesIndex.value);
      minIndex = index;
    }

    const newSelectedSlidesIndex = [];
    for (let i = minIndex; i <= maxIndex; i++) newSelectedSlidesIndex.push(i);
    mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex);
  }
  // Normal switch page
  else {
    mainStore.updateSelectedSlidesIndex([]);
    changeSlideIndex(index);
  }
};

// Set thumbnails toolbar focus state (only in focus state, the shortcut keys of this part can take effect)
const setThumbnailsFocus = (focus: boolean) => {
  if (thumbnailsFocus.value === focus) return;
  mainStore.setThumbnailsFocus(focus);

  if (!focus) mainStore.updateSelectedSlidesIndex([]);
};

// Drag and drop to adjust order and synchronize data
const handleDragEnd = (eventData: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = eventData;
  if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex) return;
  sortSlides(newIndex, oldIndex);
};

// Open notes panel
const openNotesPanel = () => {
  mainStore.setNotesPanelState(true);
};

const editingSectionId = ref('');

const editSection = (id: string) => {
  mainStore.setDisableHotkeysState(true);
  editingSectionId.value = id || 'default';

  nextTick(() => {
    const inputRef = document.querySelector(`#section-title-input-${id || 'default'}`) as HTMLInputElement;
    inputRef.focus();
  });
};

const saveSection = (e: FocusEvent | KeyboardEvent) => {
  const title = (e.target as HTMLInputElement).value;
  updateSectionTitle(editingSectionId.value, title);

  editingSectionId.value = '';
  mainStore.setDisableHotkeysState(false);
};

const insertAllTemplates = (slides: Slide[]) => {
  if (isEmptySlide.value) slidesStore.setSlides(slides);
  else addSlidesFromData(slides);
};

const contextmenusSection = (el: HTMLElement): ContextmenuItem[] => {
  const sectionId = el.dataset.sectionId!;

  return [
    {
      text: t('thumbnails.sections.deleteSection'),
      handler: () => removeSection(sectionId),
    },
    {
      text: t('thumbnails.sections.deleteSectionAndSlides'),
      handler: () => {
        mainStore.setActiveElementIdList([]);
        removeSectionSlides(sectionId);
      },
    },
    {
      text: t('thumbnails.sections.deleteAllSections'),
      handler: removeAllSection,
    },
    {
      text: t('thumbnails.sections.renameSection'),
      handler: () => editSection(sectionId),
    },
  ];
};

const { enterScreening, enterScreeningFromStart } = useScreening();

const contextmenusThumbnails = (): ContextmenuItem[] => {
  return [
    {
      text: t('thumbnails.slides.paste'),
      subText: 'Ctrl + V',
      handler: pasteSlide,
    },
    {
      text: t('thumbnails.slides.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllSlide,
    },
    {
      text: t('thumbnails.slides.newPage'),
      subText: 'Enter',
      handler: createSlide,
    },
    {
      text: t('thumbnails.slides.slideShow'),
      subText: 'F5',
      handler: enterScreeningFromStart,
    },
  ];
};

const contextmenusThumbnailItem = (): ContextmenuItem[] => {
  return [
    {
      text: t('thumbnails.slides.cut'),
      subText: 'Ctrl + X',
      handler: cutSlide,
    },
    {
      text: t('thumbnails.slides.copy'),
      subText: 'Ctrl + C',
      handler: copySlide,
    },
    {
      text: t('thumbnails.slides.paste'),
      subText: 'Ctrl + V',
      handler: pasteSlide,
    },
    {
      text: t('thumbnails.slides.selectAll'),
      subText: 'Ctrl + A',
      handler: selectAllSlide,
    },
    { divider: true },
    {
      text: t('thumbnails.slides.newPage'),
      subText: 'Enter',
      handler: createSlide,
    },
    {
      text: t('thumbnails.slides.copyPage'),
      subText: 'Ctrl + D',
      handler: copyAndPasteSlide,
    },
    {
      text: t('thumbnails.slides.deletePage'),
      subText: 'Delete',
      handler: () => deleteSlide(),
    },
    {
      text: t('thumbnails.sections.addSection'),
      handler: createSection,
      disable: !!currentSlide.value.sectionTag,
    },
    { divider: true },
    {
      text: t('thumbnails.slides.fromCurrentShow'),
      subText: 'Shift + F5',
      handler: enterScreening,
    },
  ];
};
</script>

<style lang="scss" scoped>
.thumbnails {
  height: 100%;

  :deep(.card-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
}

.add-slide {
  height: 40px;
  font-size: $smTextSize;
  display: flex;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  border-radius: $borderRadius;
  color: $secondary-foreground;
  background-color: $secondary;
  margin: $normalSpacing;

  .btn {
    flex: 1;
    font-size: $baseTextSize;
    font-weight: 500;
    border-radius: $borderRadius 0 0 $borderRadius;
    background-color: $secondary;
    &:hover {
      background-color: $primary;
    }
  }
  .select-btn {
    width: 30px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $secondary;
    border-radius: 0 $borderRadius $borderRadius 0;
    &:hover {
      background-color: $primary;
    }
  }

  .icon {
    margin-right: 3px;
    font-size: 14px !important;
    width: 14px !important;
    height: 14px !important;
    display: inline-block;
  }
}
.thumbnail-list {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding-top: $largeSpacing;
  gap: $largeSpacing;
}
.thumbnail-item {
  position: relative;

  .thumbnail {
    border-radius: $borderRadius;
    outline: 2px solid rgba($color: $themeColor, $alpha: 0.15);
  }

  &.active {
    .label {
      color: $themeColor;
    }
    .thumbnail {
      outline-color: $themeColor;
    }
  }
  &.selected {
    .thumbnail {
      outline-color: $themeColor;
    }
    .note-flag {
      background-color: $themeColor;

      &::after {
        border-top-color: $themeColor;
      }
    }
  }

  .note-flag {
    width: 16px;
    height: 12px;
    border-radius: 1px;
    position: absolute;
    left: 8px;
    top: 13px;
    font-size: 8px;
    background-color: rgba($color: $themeColor, $alpha: 0.75);
    color: $background;
    text-align: center;
    line-height: 12px;
    cursor: pointer;

    &::after {
      content: '';
      width: 0;
      height: 0;
      position: absolute;
      top: 10px;
      left: 4px;
      border: 4px solid transparent;
      border-top-color: rgba($color: $themeColor, $alpha: 0.75);
    }
  }
}
.label {
  font-size: $baseTextSize;
  color: $gray-999;
  width: 20px;
  cursor: grab;

  &.offset-left {
    position: relative;
    left: -4px;
  }

  &:active {
    cursor: grabbing;
  }
}
.page-number {
  height: 40px;
  border-top: 1px solid $borderColor;
  line-height: 40px;
  text-align: center;
  font-size: $smTextSize;
  color: $gray-666;
}
.section-title {
  height: 26px;
  font-size: 12px;
  padding: 6px 8px 2px 18px;
  color: $gray-555;

  &.contextmenu-active {
    color: $themeColor;

    .text::before {
      border-bottom-color: $themeColor;
      border-right-color: $themeColor;
    }
  }

  .text {
    display: flex;
    align-items: center;
    position: relative;

    &::before {
      content: '';
      width: 0;
      height: 0;
      border-top: 3px solid transparent;
      border-left: 3px solid transparent;
      border-bottom: 3px solid $gray-555;
      border-right: 3px solid $gray-555;
      margin-right: 5px;
    }

    .text-content {
      display: inline-block;
      @include ellipsis-oneline();
    }
  }

  input {
    width: 100%;
    border: 0;
    outline: 0;
    padding: 0;
    font-size: 12px;
  }
}

:deep(.sortable-ghost) {
  opacity: 0.5;
}

:deep(.sortable-drag) {
  .label {
    display: none;
  }
}
</style>
