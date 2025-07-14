<template>
  <MoveablePanel
    class="notes-panel"
    :width="300"
    :height="130"
    :title="t('panels.markup.title')"
    :left="-270"
    :top="90"
    @close="close()"
  >
    <div class="container">
      <div class="row">
        <div style="width: 40%">{{ $t('panels.markup.currentPageType') }}</div>
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
        <div style="width: 40%">{{ $t('panels.markup.currentTextType') }}</div>
        <Select
          style="width: 60%"
          :value="textType"
          @update:value="(value) => updateElement(value as TextType | '')"
          :options="textTypeOptions"
        />
      </div>
      <div class="row" v-else-if="handleElement && handleElement.type === 'image'">
        <div style="width: 40%">{{ $t('panels.markup.currentImageType') }}</div>
        <Select
          style="width: 60%"
          :value="imageType"
          @update:value="(value) => updateElement(value as ImageType | '')"
          :options="imageTypeOptions"
        />
      </div>
      <div class="placeholder" v-else>{{ $t('panels.markup.placeholder') }}</div>
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const slidesStore = useSlidesStore();
const mainStore = useMainStore();
const { currentSlide } = storeToRefs(slidesStore);
const { handleElement, handleElementId } = storeToRefs(mainStore);

const slideTypeOptions = ref<{ label: string; value: SlideType | '' }[]>([
  { label: $t('panels.markup.unmarkedType'), value: '' },
  { label: $t('panels.markup.pageTypes.coverPage'), value: 'cover' },
  { label: $t('panels.markup.pageTypes.tableOfContents'), value: 'contents' },
  { label: $t('panels.markup.pageTypes.transitionPage'), value: 'transition' },
  { label: $t('panels.markup.pageTypes.contentPage'), value: 'content' },
  { label: $t('panels.markup.pageTypes.endPage'), value: 'end' },
]);

const textTypeOptions = ref<{ label: string; value: TextType | '' }[]>([
  { label: $t('panels.markup.unmarkedType'), value: '' },
  { label: $t('panels.markup.title'), value: 'title' },
  { label: $t('panels.markup.textTypes.subtitle'), value: 'subtitle' },
  { label: $t('panels.markup.textTypes.content'), value: 'content' },
  { label: $t('panels.markup.textTypes.listItem'), value: 'item' },
  { label: $t('panels.markup.textTypes.listItemTitle'), value: 'itemTitle' },
  { label: $t('panels.markup.textTypes.notes'), value: 'notes' },
  { label: $t('panels.markup.textTypes.header'), value: 'header' },
  { label: $t('panels.markup.textTypes.footer'), value: 'footer' },
  { label: $t('panels.markup.textTypes.sectionNumber'), value: 'partNumber' },
  { label: $t('panels.markup.textTypes.itemNumber'), value: 'itemNumber' },
]);

const imageTypeOptions = ref<{ label: string; value: ImageType | '' }[]>([
  { label: $t('panels.markup.unmarkedType'), value: '' },
  { label: $t('panels.markup.imageTypes.pageIllustration'), value: 'pageFigure' },
  { label: $t('panels.markup.imageTypes.itemIllustration'), value: 'itemFigure' },
  { label: $t('panels.markup.imageTypes.backgroundImage'), value: 'background' },
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
