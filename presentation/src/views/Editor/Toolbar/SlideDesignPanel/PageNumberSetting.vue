<template>
  <div class="page-number-setting">
    <div class="title">{{ $t('styling.slide.design.pageNumbers.title') }}</div>

    <div class="setting-row">
      <Checkbox v-model:value="showPageNumbers">
        {{ $t('styling.slide.design.pageNumbers.showPageNumbers') }}
      </Checkbox>
    </div>

    <template v-if="showPageNumbers">
      <div class="subtitle">{{ $t('styling.slide.design.pageNumbers.position') }}</div>
      <div class="position-grid">
        <div
          v-for="position in pageNumberPositions"
          :key="position.value"
          class="position-option"
          :class="{ selected: selectedPosition === position.value }"
          @click="selectedPosition = position.value"
        >
          <div class="position-preview">
            <div class="preview-page">
              <div class="preview-number" :style="position.style"></div>
            </div>
          </div>
          <div class="position-label">{{ $t(position.label) }}</div>
        </div>
      </div>
      <div class="setting-row">
        <Checkbox v-model:value="skipTitlePage">
          {{ $t('styling.slide.design.pageNumbers.skipTitlePage') }}
        </Checkbox>
      </div>
    </template>

    <Button class="btn" type="primary" @click="applyPageNumbers">{{
      $t('styling.slide.design.confirm')
    }}</Button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type { PPTTextElement } from '@/types/slides';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import Checkbox from '@/components/Checkbox.vue';
import Button from '@/components/Button.vue';

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const slidesStore = useSlidesStore();
const { slides, viewportSize, viewportRatio, theme } = storeToRefs(slidesStore);
const { addHistorySnapshot } = useHistorySnapshot();

type PageNumberPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

const showPageNumbers = ref(true);
const skipTitlePage = ref(true);
const selectedPosition = ref<PageNumberPosition>('bottom-right');

const pageNumberPositions: Array<{
  value: PageNumberPosition;
  label: string;
  style: Record<string, string>;
}> = [
  {
    value: 'top-left',
    label: 'styling.slide.design.pageNumbers.positions.topLeft',
    style: { top: '5px', left: '5px' },
  },
  {
    value: 'top-center',
    label: 'styling.slide.design.pageNumbers.positions.topCenter',
    style: { top: '5px', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    value: 'top-right',
    label: 'styling.slide.design.pageNumbers.positions.topRight',
    style: { top: '5px', right: '5px' },
  },
  {
    value: 'bottom-left',
    label: 'styling.slide.design.pageNumbers.positions.bottomLeft',
    style: { bottom: '5px', left: '5px' },
  },
  {
    value: 'bottom-center',
    label: 'styling.slide.design.pageNumbers.positions.bottomCenter',
    style: { bottom: '5px', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    value: 'bottom-right',
    label: 'styling.slide.design.pageNumbers.positions.bottomRight',
    style: { bottom: '5px', right: '5px' },
  },
];

const getPositionCoordinates = (position: PageNumberPosition) => {
  const width = 50;
  const height = 30;
  const margin = 20;
  const slideWidth = viewportSize.value;
  const slideHeight = viewportSize.value * viewportRatio.value;

  const positions: Record<PageNumberPosition, { left: number; top: number }> = {
    'top-left': { left: margin, top: margin },
    'top-center': { left: (slideWidth - width) / 2, top: margin },
    'top-right': { left: slideWidth - width - margin, top: margin },
    'bottom-left': { left: margin, top: slideHeight - height - margin },
    'bottom-center': { left: (slideWidth - width) / 2, top: slideHeight - height - margin },
    'bottom-right': { left: slideWidth - width - margin, top: slideHeight - height - margin },
  };

  return positions[position];
};

const applyPageNumbers = () => {
  const newSlides = slides.value.map((slide, index) => {
    const filteredElements = slide.elements.filter(
      (el) => !(el.type === 'text' && (el as PPTTextElement).textType === 'pageNumber')
    );

    if (!showPageNumbers.value) {
      return {
        ...slide,
        elements: filteredElements,
      };
    }

    if (skipTitlePage.value && index === 0) {
      return {
        ...slide,
        elements: filteredElements,
      };
    }

    const pageNumber = skipTitlePage.value ? index : index + 1;
    const position = getPositionCoordinates(selectedPosition.value);

    const pageNumberElement: PPTTextElement = {
      type: 'text' as const,
      lock: true,
      id: `el-${Date.now()}-${Math.random()}`,
      left: position.left,
      top: position.top,
      width: 50,
      height: 30,
      content: pageNumber.toString(),
      rotate: 0,
      textType: 'pageNumber' as const,
      defaultFontName: theme.value.fontName,
      defaultColor: theme.value.fontColor,
      vertical: false,
    };

    return {
      ...slide,
      elements: [...filteredElements, pageNumberElement],
    };
  });

  slidesStore.setSlides(newSlides);
  addHistorySnapshot();
  emit('close');
};
</script>

<style lang="scss" scoped>
.page-number-setting {
  display: flex;
  flex-direction: column;
}

.title {
  margin-bottom: 15px;
  font-size: 17px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  margin-top: 8px;
}

.setting-row {
  margin-bottom: 12px;
  padding: 10px;
  background-color: color-mix(in srgb, var(--presentation-border) 10%, transparent);
  border-radius: var(--presentation-radius);
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 15px;
}

.position-option {
  cursor: pointer;
  padding: 8px;
  border: 2px solid var(--presentation-border);
  border-radius: var(--presentation-radius);
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: var(--presentation-primary);
    background-color: color-mix(in srgb, var(--presentation-primary) 5%, transparent);
  }

  &.selected {
    border-color: var(--presentation-primary);
    background-color: color-mix(in srgb, var(--presentation-primary) 10%, transparent);
  }
}

.position-preview {
  margin-bottom: 6px;
}

.preview-page {
  width: 70px;
  height: 50px;
  margin: 0 auto;
  border: 1px solid var(--presentation-border);
  border-radius: 2px;
  position: relative;
  background-color: var(--presentation-background);
}

.preview-number {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--presentation-primary);
  border-radius: 2px;
}

.position-label {
  font-size: 12px;
}

.btn {
  width: 100%;
  margin-top: 12px;
}
</style>
