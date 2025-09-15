<template>
  <div class="slide-animation-panel">
    <div class="animation-pool">
      <div
        class="animation-item center"
        :class="{ active: currentTurningMode === item.value }"
        v-for="item in animations"
        :key="item.label"
        @click="updateTurningMode(item.value)"
      >
        <div :class="['animation-block', item.value]"></div>
        <div class="animation-text">{{ item.label }}</div>
      </div>
    </div>
    <Button style="width: 100%" @click="applyAllSlide()">{{
      $t('styling.slide.transition.applyToAll')
    }}</Button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import type { TurningMode } from '@/types/slides';
import { getSlideAnimations } from '@/configs/animation';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import message from '@/utils/message';
import Button from '@/components/Button.vue';
import { useI18n } from 'vue-i18n';

const slidesStore = useSlidesStore();
const { slides, currentSlide } = storeToRefs(slidesStore);

const currentTurningMode = computed(() => currentSlide.value.turningMode || 'slideY');

const animations = getSlideAnimations();

const { addHistorySnapshot } = useHistorySnapshot();
const { t } = useI18n();

// Modify the page transition mode during playback
const updateTurningMode = (mode: TurningMode) => {
  if (mode === currentTurningMode.value) return;
  slidesStore.updateSlide({ turningMode: mode });
  addHistorySnapshot();
};

// Apply the current page's transition mode to all pages
const applyAllSlide = () => {
  const newSlides = slides.value.map((slide) => {
    return {
      ...slide,
      turningMode: currentSlide.value.turningMode,
    };
  });
  slidesStore.setSlides(newSlides);
  message.success(t('styling.slide.transition.appliedToAll'));
  addHistorySnapshot();
};
</script>

<style lang="scss" scoped>
.animation-pool {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.animation-item {
  width: 50%;
  height: 100px;
  border: solid 1px #d6d6d6;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 15px 0;
  position: relative;
  cursor: pointer;
  border-radius: var(--presentation-radius);

  &.active {
    border-color: var(--presentation-primary);
    z-index: 1;
  }

  &:nth-child(2n) {
    margin-left: -1px;
  }
  &:nth-child(n + 3) {
    margin-top: -1px;
  }
}
.animation-block {
  width: 64px;
  height: 36px;
  background: #666;
  position: relative;
  overflow: hidden;

  @mixin elAnimation($animationType) {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: color-mix(in srgb, var(--presentation-primary) 75%, transparent);
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: $animationType 0.3s linear;
  }

  &.fade:hover {
    &::after {
      @include elAnimation(fade);
    }
  }
  &.slideX:hover {
    &::after {
      @include elAnimation(slideX);
    }
  }
  &.slideY:hover {
    &::after {
      @include elAnimation(slideY);
    }
  }
  &.slideX3D:hover {
    &::after {
      @include elAnimation(slideX3D);
    }
  }
  &.slideY3D:hover {
    &::after {
      @include elAnimation(slideY3D);
    }
  }
  &.rotate:hover {
    &::after {
      transform-origin: 0 0;
      @include elAnimation(rotate);
    }
  }
  &.scaleY:hover {
    &::after {
      @include elAnimation(scaleY);
    }
  }
  &.scaleX:hover {
    &::after {
      @include elAnimation(scaleX);
    }
  }
  &.scale:hover {
    &::after {
      @include elAnimation(scale);
    }
  }
  &.scaleReverse:hover {
    &::after {
      @include elAnimation(scaleReverse);
    }
  }
}
.animation-text {
  font-size: 0.8125rem;
  width: 90%;
  color: #333;
  text-align: center;
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes slideX {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes slideY {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes slideX3D {
  0% {
    transform: translateX(100%) scale(0.5);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes slideY3D {
  0% {
    transform: translateY(100%) scale(0.5);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes rotate {
  0% {
    transform: rotate(-90deg);
  }
  100% {
    transform: rotate(0);
  }
}
@keyframes scaleY {
  0% {
    transform: scaleY(0.1);
  }
  100% {
    transform: scaleY(1);
  }
}
@keyframes scaleX {
  0% {
    transform: scaleX(0.1);
  }
  100% {
    transform: scaleY(1);
  }
}
@keyframes scale {
  0% {
    transform: scale(0.25);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes scaleReverse {
  0% {
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
