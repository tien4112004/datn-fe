<template>
  <div class="slide-design-panel">
    <div class="title title-panel">{{ $t('styling.slide.design.background.backgroundFill') }}</div>
    <div class="row">
      <Select
        style="flex: 1"
        :value="background.type"
        @update:value="(value) => updateBackgroundType(value as 'gradient' | 'image' | 'solid')"
        :options="[
          { label: $t('styling.slide.design.background.solidFill'), value: 'solid' },
          { label: $t('styling.slide.design.background.imageFill'), value: 'image' },
          { label: $t('styling.slide.design.background.gradientFill'), value: 'gradient' },
        ]"
      />
      <div style="width: 10px"></div>

      <Popover trigger="click" v-if="background.type === 'solid'" style="flex: 1">
        <template #content>
          <ColorPicker
            :modelValue="background.color"
            @update:modelValue="(color) => updateBackground({ color })"
          />
        </template>
        <ColorButton :color="background.color || 'var(--background)'" />
      </Popover>

      <Select
        style="flex: 1"
        :value="background.image?.size || 'cover'"
        @update:value="(value) => updateImageBackground({ size: value as SlideBackgroundImageSize })"
        v-else-if="background.type === 'image'"
        :options="[
          { label: $t('styling.slide.design.background.scale'), value: 'contain' },
          { label: $t('styling.slide.design.background.tile'), value: 'repeat' },
          { label: $t('styling.slide.design.background.cover'), value: 'cover' },
        ]"
      />

      <Select
        style="flex: 1"
        :value="background.gradient?.type || ''"
        @update:value="(value) => updateGradientBackground({ type: value as GradientType })"
        v-else
        :options="[
          { label: $t('styling.slide.design.background.linearGradient'), value: 'linear' },
          { label: $t('styling.slide.design.background.radialGradient'), value: 'radial' },
        ]"
      />
    </div>

    <div class="background-image-wrapper" v-if="background.type === 'image'">
      <FileInput @change="(files) => uploadBackgroundImage(files)">
        <div class="background-image">
          <div class="content" :style="{ backgroundImage: `url(${background.image?.src})` }">
            <IconPlus />
          </div>
        </div>
      </FileInput>
    </div>

    <div class="background-gradient-wrapper" v-if="background.type === 'gradient'">
      <div class="row">
        <GradientBar
          :value="background.gradient?.colors || []"
          :index="currentGradientIndex"
          @update:value="(value) => updateGradientBackground({ colors: value })"
          @update:index="(index) => (currentGradientIndex = index)"
        />
      </div>
      <div class="row">
        <div style="width: 40%">{{ $t('styling.slide.design.theme.currentColorBlock') }}</div>
        <Popover trigger="click" style="width: 60%">
          <template #content>
            <ColorPicker
              :modelValue="background.gradient!.colors[currentGradientIndex].color"
              @update:modelValue="(value) => updateGradientBackgroundColors(value)"
            />
          </template>
          <ColorButton :color="background.gradient!.colors[currentGradientIndex].color" />
        </Popover>
      </div>
      <div class="row" v-if="background.gradient?.type === 'linear'">
        <div style="width: 40%">{{ $t('styling.slide.design.theme.gradientAngle') }}</div>
        <Slider
          :min="0"
          :max="360"
          :step="15"
          :value="background.gradient.rotate || 0"
          @update:value="(value) => updateGradientBackground({ rotate: value as number })"
          style="width: 60%"
        />
      </div>
    </div>

    <div class="row">
      <Button style="flex: 1" @click="applyBackgroundAllSlide()">{{
        $t('styling.slide.design.background.applyBackgroundToAll')
      }}</Button>
    </div>

    <Divider />

    <div class="row">
      <Select
        style="width: 100%"
        :value="viewportRatio"
        @update:value="(value) => updateViewportRatio(value as number)"
        :options="[
          { label: $t('styling.slide.design.aspectRatios.widescreen169'), value: 0.5625 },
          { label: $t('styling.slide.design.aspectRatios.widescreen1610'), value: 0.625 },
          { label: $t('styling.slide.design.aspectRatios.standard43'), value: 0.75 },
          { label: $t('styling.slide.design.aspectRatios.paperA'), value: 0.70710678 },
          { label: $t('styling.slide.design.aspectRatios.portraitA'), value: 1.41421356 },
        ]"
      />
    </div>

    <div class="row">
      <div class="canvas-size">
        {{ $t('styling.slide.design.canvasSize') }} {{ viewportSize }} ×
        {{ toFixed(viewportSize * viewportRatio) }}
      </div>
    </div>

    <Divider />

    <div class="title">
      <span class="title-panel">{{ $t('styling.slide.design.theme.mainTheme') }}</span>
      <span class="more" @click="moreThemeConfigsVisible = !moreThemeConfigsVisible">
        <span class="text">
          {{ moreThemeConfigsVisible ? $t('ui.actions.hide') : $t('ui.actions.more') }}
        </span>
        <IconDown v-if="moreThemeConfigsVisible" />
        <IconRight v-else />
      </span>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.slide.design.theme.font') }}</div>
      <Select
        style="width: 60%"
        :value="theme.fontName"
        search
        :searchLabel="$t('styling.slide.design.theme.searchFont')"
        @update:value="(value) => updateTheme({ fontName: value as string })"
        :options="FONTS"
      />
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.slide.design.theme.fontColor') }}</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="theme.fontColor"
            @update:modelValue="(value) => updateTheme({ fontColor: value })"
          />
        </template>
        <ColorButton :color="theme.fontColor" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.slide.design.theme.titleFont') }}</div>
      <Select
        style="width: 60%"
        :value="theme.titleFontName"
        search
        :searchLabel="$t('styling.slide.design.theme.searchFont')"
        @update:value="(value) => updateTheme({ titleFontName: value as string })"
        :options="FONTS"
      />
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.slide.design.theme.titleFontColor') }}</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="theme.titleFontColor"
            @update:modelValue="(value) => updateTheme({ titleFontColor: value })"
          />
        </template>
        <ColorButton :color="theme.titleFontColor" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.slide.design.theme.backgroundColor') }}</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="theme.backgroundColor"
            @update:modelValue="(value) => updateTheme({ backgroundColor: value })"
          />
        </template>
        <ColorButton :color="theme.backgroundColor" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%">{{ $t('styling.slide.design.theme.themeColor') }}</div>
      <ColorListButton
        style="width: 60%"
        :colors="theme.themeColors"
        @click="themeColorsSettingVisible = true"
      />
    </div>

    <template v-if="moreThemeConfigsVisible">
      <div class="row">
        <div style="width: 40%">{{ $t('styling.slide.design.style.borderStyle') }}</div>
        <SelectCustom style="width: 60%">
          <template #options>
            <div
              class="option"
              v-for="item in lineStyleOptions"
              :key="item"
              @click="updateTheme({ outline: { ...theme.outline, style: item } })"
            >
              <SVGLine :type="item" />
            </div>
          </template>
          <template #label>
            <SVGLine :type="theme.outline.style" />
          </template>
        </SelectCustom>
      </div>
      <div class="row">
        <div style="width: 40%">{{ $t('styling.slide.design.style.borderColor') }}</div>
        <Popover trigger="click" style="width: 60%">
          <template #content>
            <ColorPicker
              :modelValue="theme.outline.color"
              @update:modelValue="(value) => updateTheme({ outline: { ...theme.outline, color: value } })"
            />
          </template>
          <ColorButton :color="theme.outline.color || 'var(--foreground)'" />
        </Popover>
      </div>
      <div class="row">
        <div style="width: 40%">{{ $t('styling.slide.design.style.borderWidth') }}</div>
        <NumberInput
          :value="theme.outline.width || 0"
          @update:value="(value) => updateTheme({ outline: { ...theme.outline, width: value } })"
          style="width: 60%"
        />
      </div>
      <div class="row" style="height: 30px">
        <div style="width: 40%">{{ $t('styling.slide.design.style.horizontalShadow') }}</div>
        <Slider
          style="width: 60%"
          :min="-10"
          :max="10"
          :step="1"
          :value="theme.shadow.h"
          @update:value="(value) => updateTheme({ shadow: { ...theme.shadow, h: value as number } })"
        />
      </div>
      <div class="row" style="height: 30px">
        <div style="width: 40%">{{ $t('styling.slide.design.style.verticalShadow') }}</div>
        <Slider
          style="width: 60%"
          :min="-10"
          :max="10"
          :step="1"
          :value="theme.shadow.v"
          @update:value="(value) => updateTheme({ shadow: { ...theme.shadow, v: value as number } })"
        />
      </div>
      <div class="row" style="height: 30px">
        <div style="width: 40%">{{ $t('styling.slide.design.style.blurDistance') }}</div>
        <Slider
          style="width: 60%"
          :min="1"
          :max="20"
          :step="1"
          :value="theme.shadow.blur"
          @update:value="(value) => updateTheme({ shadow: { ...theme.shadow, blur: value as number } })"
        />
      </div>
      <div class="row">
        <div style="width: 40%">{{ $t('styling.slide.design.style.shadowColor') }}</div>
        <Popover trigger="click" style="width: 60%">
          <template #content>
            <ColorPicker
              :modelValue="theme.shadow.color"
              @update:modelValue="(value) => updateTheme({ shadow: { ...theme.shadow, color: value } })"
            />
          </template>
          <ColorButton :color="theme.shadow.color" />
        </Popover>
      </div>
    </template>

    <div class="row">
      <Button style="flex: 1" @click="applyThemeToAllSlides(moreThemeConfigsVisible)">{{
        $t('styling.slide.design.applyThemeToAll')
      }}</Button>
    </div>

    <div class="row">
      <Button style="flex: 1" @click="themeStylesExtractVisible = true">
        {{ $t('styling.slide.design.extractThemeFromSlide') }}
      </Button>
    </div>

    <Divider />

    <div class="title title-panel">{{ $t('styling.slide.design.presetThemes') }}</div>
    <div class="theme-list">
      <div
        class="theme-item"
        v-for="(item, index) in PRESET_THEMES"
        :key="index"
        :style="{
          backgroundColor: item.background,
          fontFamily: item.fontname,
        }"
      >
        <div class="theme-item-content">
          <div class="text" :style="{ color: item.fontColor }">{{ $t('styling.slide.design.textAa') }}</div>
          <div class="colors">
            <div
              class="color-block"
              v-for="(color, index) in item.colors"
              :key="index"
              :style="{ backgroundColor: color }"
            ></div>
          </div>

          <div class="btns">
            <Button type="primary" size="small" @click="applyPresetTheme(item)">{{
              $t('styling.slide.design.set')
            }}</Button>
            <Button
              type="primary"
              size="small"
              style="margin-top: 3px"
              @click="applyPresetTheme(item, true)"
              >{{ $t('styling.slide.design.setAndApply') }}</Button
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal v-model:visible="themeStylesExtractVisible" :width="320" @closed="themeStylesExtractVisible = false">
    <ThemeStylesExtract @close="themeStylesExtractVisible = false" />
  </Modal>

  <Modal v-model:visible="themeColorsSettingVisible" :width="310" @closed="themeColorsSettingVisible = false">
    <ThemeColorsSetting @close="themeColorsSettingVisible = false" />
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type {
  Gradient,
  GradientType,
  SlideBackground,
  SlideBackgroundType,
  SlideTheme,
  SlideBackgroundImage,
  SlideBackgroundImageSize,
  LineStyleType,
} from '@/types/slides';
import { PRESET_THEMES } from '@/configs/theme';
import { FONTS } from '@/configs/font';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import useSlideTheme from '@/hooks/useSlideTheme';
import { getImageDataURL } from '@/utils/image';
import { useI18n } from 'vue-i18n';

import ThemeStylesExtract from './ThemeStylesExtract.vue';
import ThemeColorsSetting from './ThemeColorsSetting.vue';
import SVGLine from '../common/SVGLine.vue';
import ColorButton from '@/components/ColorButton.vue';
import ColorListButton from '@/components/ColorListButton.vue';
import FileInput from '@/components/FileInput.vue';
import ColorPicker from '@/components/ColorPicker/index.vue';
import Divider from '@/components/Divider.vue';
import Slider from '@/components/Slider.vue';
import Button from '@/components/Button.vue';
import Select from '@/components/Select.vue';
import Popover from '@/components/Popover.vue';
import SelectCustom from '@/components/SelectCustom.vue';
import NumberInput from '@/components/NumberInput.vue';
import Modal from '@/components/Modal.vue';
import GradientBar from '@/components/GradientBar.vue';

const slidesStore = useSlidesStore();
const { slides, currentSlide, slideIndex, viewportRatio, viewportSize, theme } = storeToRefs(slidesStore);

const moreThemeConfigsVisible = ref(false);
const themeStylesExtractVisible = ref(false);
const themeColorsSettingVisible = ref(false);
const currentGradientIndex = ref(0);
const lineStyleOptions = ref<LineStyleType[]>(['solid', 'dashed', 'dotted']);

const background = computed(() => {
  if (!currentSlide.value.background) {
    return {
      type: 'solid',
      value: 'var(--background)',
    } as SlideBackground;
  }
  return currentSlide.value.background;
});

const { addHistorySnapshot } = useHistorySnapshot();
const { applyPresetTheme, applyThemeToAllSlides } = useSlideTheme();
const { t } = useI18n();

watch(slideIndex, () => {
  currentGradientIndex.value = 0;
});

// Set background mode: solid color, image, gradient
const updateBackgroundType = (type: SlideBackgroundType) => {
  if (type === 'solid') {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'solid',
      color: background.value.color || 'var(--background)',
    };
    slidesStore.updateSlide({ background: newBackground });
  } else if (type === 'image') {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'image',
      image: background.value.image || {
        src: '',
        size: 'cover',
      },
    };
    slidesStore.updateSlide({ background: newBackground });
  } else {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'gradient',
      gradient: background.value.gradient || {
        type: 'linear',
        colors: [
          { pos: 0, color: 'var(--background)' },
          { pos: 100, color: 'var(--background)' },
        ],
        rotate: 0,
      },
    };
    currentGradientIndex.value = 0;
    slidesStore.updateSlide({ background: newBackground });
  }
  addHistorySnapshot();
};

//  Set background
const updateBackground = (props: Partial<SlideBackground>) => {
  slidesStore.updateSlide({ background: { ...background.value, ...props } });
  addHistorySnapshot();
};

// Set gradient background
const updateGradientBackground = (props: Partial<Gradient>) => {
  updateBackground({ gradient: { ...background.value.gradient!, ...props } });
};
const updateGradientBackgroundColors = (color: string) => {
  const colors = background.value.gradient!.colors.map((item, index) => {
    if (index === currentGradientIndex.value) return { ...item, color };
    return item;
  });
  updateGradientBackground({ colors });
};

// Set image background
const updateImageBackground = (props: Partial<SlideBackgroundImage>) => {
  updateBackground({ image: { ...background.value.image!, ...props } });
};

// Upload background image
const uploadBackgroundImage = (files: FileList) => {
  const imageFile = files[0];
  if (!imageFile) return;
  getImageDataURL(imageFile).then((dataURL) => updateImageBackground({ src: dataURL }));
};

// Apply current page background to all pages
const applyBackgroundAllSlide = () => {
  const newSlides = slides.value.map((slide) => {
    return {
      ...slide,
      background: currentSlide.value.background,
    };
  });
  slidesStore.setSlides(newSlides);
  addHistorySnapshot();
};

// Set theme
const updateTheme = (themeProps: Partial<SlideTheme>) => {
  slidesStore.setTheme(themeProps);
};

// Set canvas size (aspect ratio)
const updateViewportRatio = (value: number) => {
  slidesStore.setViewportRatio(value);
};

const toFixed = (num: number) => {
  if (num % 1 !== 0) {
    return parseFloat(num.toFixed(1));
  }
  return Math.floor(num);
};
</script>

<style lang="scss" scoped>
.slide-design-panel {
  user-select: none;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .more {
    display: flex;
    align-items: center;
    cursor: pointer;

    .text {
      margin-right: 3px;
    }
  }
}
.background-image-wrapper {
  margin-bottom: 10px;
}
.background-image {
  height: 0;
  padding-bottom: 56.25%;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  position: relative;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .content {
    @include absolute-0();

    display: flex;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
  }
}
.canvas-size {
  width: 100%;
  color: #888;
  font-size: 0.75rem;
  text-align: center;
}

.theme-list {
  @include flex-grid-layout();
}
.theme-item {
  @include flex-grid-layout-children(2, 48%);

  padding-bottom: 27%;
  border-radius: var(--radius);
  position: relative;
  cursor: pointer;

  .theme-item-content {
    @include absolute-0();

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .text {
    font-size: 0.875rem;
  }
  .colors {
    display: flex;
    margin-top: 6px;
  }
  .color-block {
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }

  &:hover .btns {
    opacity: 1;
  }

  .btns {
    @include absolute-0();

    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: flex;
    background-color: rgba($color: var(--foreground), $alpha: 0.25);
    opacity: 0;
    transition: opacity 0.2s;
  }
}
.option {
  height: 32px;
  padding: 0 5px;
  border-radius: var(--radius);

  &:not(.selected):hover {
    background-color: rgba($color: var(--primary), $alpha: 0.05);
    cursor: pointer;
  }

  &.selected {
    color: var(--primary);
    font-weight: 700;
  }
}
</style>
