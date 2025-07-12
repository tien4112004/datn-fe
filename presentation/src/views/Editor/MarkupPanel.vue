<template>
  <MoveablePanel
    class="notes-panel"
    :width="300"
    :height="130"
    title="Slide Type Annotation"
    :left="-270"
    :top="90"
    @close="close()"
  >
    <div class="container">
      <div class="row">
        <div style="width: 40%">Current Page Type:</div>
        <Select
          style="width: 60%"
          :value="slideType"
          @update:value="(value) => updateSlide(value as SlideType | '')"
          :options="slideTypeOptions"
        />
      </div>
      <div
        class="row"
        v-if="
          handleElement &&
          (handleElement.type === 'text' || (handleElement.type === 'shape' && handleElement.text))
        "
      >
        <div style="width: 40%">Current Text Type:</div>
        <Select
          style="width: 60%"
          :value="textType"
          @update:value="(value) => updateElement(value as TextType | '')"
          :options="textTypeOptions"
        />
      </div>
      <div class="row" v-else-if="handleElement && handleElement.type === 'image'">
        <div style="width: 40%">Current Image Type:</div>
        <Select
          style="width: 60%"
          :value="imageType"
          @update:value="(value) => updateElement(value as ImageType | '')"
          :options="imageTypeOptions"
        />
      </div>
      <div class="placeholder" v-else>Select image, text, or shape with text to mark type</div>
    </div>
  </MoveablePanel>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { ImageType, SlideType, TextType } from '@/types/slides';

import MoveablePanel from '@/components/MoveablePanel.vue';
import Select from '@/components/Select.vue';

const slidesStore = useSlidesStore();
const mainStore = useMainStore();
const { currentSlide } = storeToRefs(slidesStore);
const { handleElement, handleElementId } = storeToRefs(mainStore);

const slideTypeOptions = ref<{ label: string; value: SlideType | '' }[]>([
  { label: 'Unmarked Type', value: '' },
  { label: 'Cover Page', value: 'cover' },
  { label: 'Table of Contents', value: 'contents' },
  { label: 'Transition Page', value: 'transition' },
  { label: 'Content Page', value: 'content' },
  { label: 'End Page', value: 'end' },
]);

const textTypeOptions = ref<{ label: string; value: TextType | '' }[]>([
  { label: 'Unmarked Type', value: '' },
  { label: 'Title', value: 'title' },
  { label: 'Subtitle', value: 'subtitle' },
  { label: 'Content', value: 'content' },
  { label: 'List Item', value: 'item' },
  { label: 'List Item Title', value: 'itemTitle' },
  { label: 'Notes', value: 'notes' },
  { label: 'Header', value: 'header' },
  { label: 'Footer', value: 'footer' },
  { label: 'Section Number', value: 'partNumber' },
  { label: 'Item Number', value: 'itemNumber' },
]);

const imageTypeOptions = ref<{ label: string; value: ImageType | '' }[]>([
  { label: 'Unmarked Type', value: '' },
  { label: 'Page Illustration', value: 'pageFigure' },
  { label: 'Item Illustration', value: 'itemFigure' },
  { label: 'Background Image', value: 'background' },
]);

const slideType = computed(() => currentSlide.value?.type || '');
const textType = computed(() => {
  if (!handleElement.value) return '';
  if (handleElement.value.type === 'text') return handleElement.value.textType || '';
  if (handleElement.value.type === 'shape' && handleElement.value.text)
    return handleElement.value.text.type || '';
  return '';
});
const imageType = computed(() => {
  if (!handleElement.value) return '';
  if (handleElement.value.type === 'image') return handleElement.value.imageType || '';
  return '';
});

const updateSlide = (type: SlideType | '') => {
  if (type) slidesStore.updateSlide({ type });
  else {
    slidesStore.removeSlideProps({
      id: currentSlide.value.id,
      propName: 'type',
    });
  }
};

const updateElement = (type: TextType | ImageType | '') => {
  if (!handleElement.value) return;
  if (handleElement.value.type === 'image') {
    if (type) {
      slidesStore.updateElement({
        id: handleElementId.value,
        props: { imageType: type as ImageType },
      });
    } else {
      slidesStore.removeElementProps({
        id: handleElementId.value,
        propName: 'imageType',
      });
    }
  }
  if (handleElement.value.type === 'text') {
    if (type) {
      slidesStore.updateElement({
        id: handleElementId.value,
        props: { textType: type as TextType },
      });
    } else {
      slidesStore.removeElementProps({
        id: handleElementId.value,
        propName: 'textType',
      });
    }
  }
  if (handleElement.value.type === 'shape') {
    const text = handleElement.value.text;
    if (!text) return;

    if (type) {
      slidesStore.updateElement({
        id: handleElementId.value,
        props: { text: { ...text, type: type as TextType } },
      });
    } else {
      delete text.type;
      slidesStore.updateElement({
        id: handleElementId.value,
        props: { text },
      });
    }
  }
};

const close = () => {
  mainStore.setMarkupPanelState(false);
};
</script>

<style lang="scss" scoped>
.notes-panel {
  height: 100%;
  font-size: 12px;
  user-select: none;
}
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;

  & + .row {
    margin-top: 5px;
  }
}
.placeholder {
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: $gray-999;
  font-style: italic;
  border: 1px dashed #ccc;
  border-radius: $borderRadius;
  margin-top: 5px;
}
</style>
