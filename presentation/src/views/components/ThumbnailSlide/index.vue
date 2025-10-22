<template>
  <div
    class="thumbnail-slide"
    ref="thumbnail"
    :style="{
      width: size === 'auto' ? '100%' : size + 'px',
      height: size === 'auto' ? viewportSize * viewportRatio * scale + 'px' : size * viewportRatio + 'px',
    }"
  >
    <div
      class="elements"
      :style="{
        width: viewportSize + 'px',
        height: viewportSize * viewportRatio + 'px',
        transform: `scale(${scale})`,
      }"
      v-if="visible"
    >
      <div class="background" :style="backgroundStyle"></div>
      <ThumbnailElement
        v-for="(element, index) in slide.elements"
        :key="element.id"
        :elementInfo="element"
        :elementIndex="index + 1"
      />
    </div>
    <div class="placeholder" v-else>{{ $t('elements.media.thumbnails.loading') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, provide, ref, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type { Slide } from '@/types/slides';
import { injectKeySlideScale } from '@/types/injectKey';
import useSlideBackgroundStyle from '@/hooks/useSlideBackgroundStyle';

import ThumbnailElement from './ThumbnailElement.vue';

const props = withDefaults(
  defineProps<{
    slide: Slide;
    size: number | 'auto';
    visible?: boolean;
  }>(),
  {
    visible: true,
  }
);

const { viewportRatio, viewportSize } = storeToRefs(useSlidesStore());

const background = computed(() => props.slide.background);
const { backgroundStyle } = useSlideBackgroundStyle(background);

const thumbnail = ref<HTMLElement | null>(null);

const scale = ref(1);

watchEffect(() => {
  if (props.size !== 'auto') {
    scale.value = props.size / viewportSize.value;
  }
});

onMounted(() => {
  if (thumbnail.value) {
    if (props.size === 'auto') {
      const width = thumbnail.value.offsetWidth;
      scale.value = width / viewportSize.value;
    }

    // Watch for resize changes
    const resizeObserver = new ResizeObserver(() => {
      if (props.size === 'auto' && thumbnail.value) {
        const width = thumbnail.value.offsetWidth;
        scale.value = width / viewportSize.value;
      }
    });

    resizeObserver.observe(thumbnail.value);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }
});

provide(injectKeySlideScale, scale);
</script>

<style lang="scss" scoped>
.thumbnail-slide {
  //   background-color: var(--presentation-background);
  // border-radius: 10px;
  user-select: none;
}
.elements {
  transform-origin: 0 0;
}
.background {
  width: 100%;
  height: 100%;
  background-position: center;
  position: absolute;
}
.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
