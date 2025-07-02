import { onMounted, onUnmounted, ref } from 'vue';
import { throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import { useSlidesStore } from '@/store';
import { KEYS } from '@/configs/hotkey';
import { ANIMATION_CLASS_PREFIX } from '@/configs/animation';
import message from '@/utils/message';

export default () => {
  const slidesStore = useSlidesStore();
  const { slides, slideIndex, formatedAnimations } = storeToRefs(slidesStore);

  // Current page element animation execution position
  const animationIndex = ref(0);

  // Animation execution state
  const inAnimation = ref(false);

  // Minimum played page index
  const playedSlidesMinIndex = ref(slideIndex.value);

  // Execute element animation
  const runAnimation = () => {
    // When animation is executing, prevent other new animations from starting
    if (inAnimation.value) return;

    const { animations, autoNext } = formatedAnimations.value[animationIndex.value];
    animationIndex.value += 1;

    // Mark start of animation execution
    inAnimation.value = true;

    let endAnimationCount = 0;

    // Execute all animations at this position in sequence
    for (const animation of animations) {
      const elRef: HTMLElement | null = document.querySelector(
        `#screen-element-${animation.elId} [class^=base-element-]`
      );
      if (!elRef) {
        endAnimationCount += 1;
        continue;
      }

      const animationName = `${ANIMATION_CLASS_PREFIX}${animation.effect}`;

      // Clear original animation state before executing animation (if any)
      elRef.style.removeProperty('--animate-duration');
      for (const classname of elRef.classList) {
        if (classname.indexOf(ANIMATION_CLASS_PREFIX) !== -1)
          elRef.classList.remove(classname, `${ANIMATION_CLASS_PREFIX}animated`);
      }

      // Execute animation
      elRef.style.setProperty('--animate-duration', `${animation.duration}ms`);
      elRef.classList.add(animationName, `${ANIMATION_CLASS_PREFIX}animated`);

      // Execute animation end, clear animation state except "out"
      const handleAnimationEnd = () => {
        if (animation.type !== 'out') {
          elRef.style.removeProperty('--animate-duration');
          elRef.classList.remove(animationName, `${ANIMATION_CLASS_PREFIX}animated`);
        }

        // Determine if all animations at this position have ended, mark animation execution completed, and try to continue execution (if needed)
        endAnimationCount += 1;
        if (endAnimationCount === animations.length) {
          inAnimation.value = false;
          if (autoNext) runAnimation();
        }
      };
      elRef.addEventListener('animationend', handleAnimationEnd, {
        once: true,
      });
    }
  };

  onMounted(() => {
    const firstAnimations = formatedAnimations.value[0];
    if (firstAnimations && firstAnimations.animations.length) {
      const autoExecFirstAnimations = firstAnimations.animations.every(
        (item) => item.trigger === 'auto' || item.trigger === 'meantime'
      );
      if (autoExecFirstAnimations) runAnimation();
    }
  });

  // Revoke element animation, except for moving the index forward and clearing animation state
  const revokeAnimation = () => {
    animationIndex.value -= 1;
    const { animations } = formatedAnimations.value[animationIndex.value];

    for (const animation of animations) {
      const elRef: HTMLElement | null = document.querySelector(
        `#screen-element-${animation.elId} [class^=base-element-]`
      );
      if (!elRef) continue;

      elRef.style.removeProperty('--animate-duration');
      for (const classname of elRef.classList) {
        if (classname.indexOf(ANIMATION_CLASS_PREFIX) !== -1)
          elRef.classList.remove(classname, `${ANIMATION_CLASS_PREFIX}animated`);
      }
    }

    // If revoking when this position has only emphasized animation, execute revoking again
    if (animations.every((item) => item.type === 'attention')) execPrev();
  };

  // Close automatic playback
  const autoPlayTimer = ref(0);
  const closeAutoPlay = () => {
    if (autoPlayTimer.value) {
      clearInterval(autoPlayTimer.value);
      autoPlayTimer.value = 0;
    }
  };
  onUnmounted(closeAutoPlay);

  // Loop playback
  const loopPlay = ref(false);
  const setLoopPlay = (loop: boolean) => {
    loopPlay.value = loop;
  };

  const throttleMassage = throttle(
    function (msg) {
      message.success(msg);
    },
    1000,
    { leading: true, trailing: false }
  );

  // Up/Down playback
  // When encountering element animation, prioritize animation playback; if no animation, execute page flip
  // When encountering animation during upward playback, only revoke to the state before animation execution, no need to reverse play animation
  // When revoking to the previous page, if this page has never been played (meaning no animation state exists), set animation index to minimum value (initial state), otherwise set to maximum value (final state)
  const execPrev = () => {
    if (formatedAnimations.value.length && animationIndex.value > 0) {
      revokeAnimation();
    } else if (slideIndex.value > 0) {
      slidesStore.updateSlideIndex(slideIndex.value - 1);
      if (slideIndex.value < playedSlidesMinIndex.value) {
        animationIndex.value = 0;
        playedSlidesMinIndex.value = slideIndex.value;
      } else animationIndex.value = formatedAnimations.value.length;
    } else {
      if (loopPlay.value) turnSlideToIndex(slides.value.length - 1);
      else throttleMassage('Already at the first page');
    }
    inAnimation.value = false;
  };
  const execNext = () => {
    if (formatedAnimations.value.length && animationIndex.value < formatedAnimations.value.length) {
      runAnimation();
    } else if (slideIndex.value < slides.value.length - 1) {
      slidesStore.updateSlideIndex(slideIndex.value + 1);
      animationIndex.value = 0;
      inAnimation.value = false;
    } else {
      if (loopPlay.value) turnSlideToIndex(0);
      else {
        throttleMassage('Already at the last page');
        closeAutoPlay();
      }
      inAnimation.value = false;
    }
  };

  // Automatic playback
  const autoPlayInterval = ref(2500);
  const autoPlay = () => {
    closeAutoPlay();
    message.success('Auto playback started');
    autoPlayTimer.value = setInterval(execNext, autoPlayInterval.value);
  };

  const setAutoPlayInterval = (interval: number) => {
    closeAutoPlay();
    autoPlayInterval.value = interval;
    autoPlay();
  };

  // Mouse scroll page flip
  const mousewheelListener = throttle(
    function (e: WheelEvent) {
      if (e.deltaY < 0) execPrev();
      else if (e.deltaY > 0) execNext();
    },
    500,
    { leading: true, trailing: false }
  );

  // Touch screen vertical slide page flip
  const touchInfo = ref<{ x: number; y: number } | null>(null);

  const touchStartListener = (e: TouchEvent) => {
    touchInfo.value = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
    };
  };
  const touchEndListener = (e: TouchEvent) => {
    if (!touchInfo.value) return;

    const offsetX = Math.abs(touchInfo.value.x - e.changedTouches[0].pageX);
    const offsetY = e.changedTouches[0].pageY - touchInfo.value.y;

    if (Math.abs(offsetY) > offsetX && Math.abs(offsetY) > 50) {
      touchInfo.value = null;

      if (offsetY > 0) execPrev();
      else execNext();
    }
  };

  // Shortcut key page flip
  const keydownListener = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();

    if (key === KEYS.UP || key === KEYS.LEFT || key === KEYS.PAGEUP) execPrev();
    else if (
      key === KEYS.DOWN ||
      key === KEYS.RIGHT ||
      key === KEYS.SPACE ||
      key === KEYS.ENTER ||
      key === KEYS.PAGEDOWN
    )
      execNext();
  };

  onMounted(() => document.addEventListener('keydown', keydownListener));
  onUnmounted(() => document.removeEventListener('keydown', keydownListener));

  // Turn to previous/previous slide (ignore element entrance animation)
  const turnPrevSlide = () => {
    slidesStore.updateSlideIndex(slideIndex.value - 1);
    animationIndex.value = 0;
  };
  const turnNextSlide = () => {
    slidesStore.updateSlideIndex(slideIndex.value + 1);
    animationIndex.value = 0;
  };

  // Turn slide to specified page
  const turnSlideToIndex = (index: number) => {
    slidesStore.updateSlideIndex(index);
    animationIndex.value = 0;
  };
  const turnSlideToId = (id: string) => {
    const index = slides.value.findIndex((slide) => slide.id === id);
    if (index !== -1) {
      slidesStore.updateSlideIndex(index);
      animationIndex.value = 0;
    }
  };

  return {
    autoPlayTimer,
    autoPlayInterval,
    setAutoPlayInterval,
    autoPlay,
    closeAutoPlay,
    loopPlay,
    setLoopPlay,
    mousewheelListener,
    touchStartListener,
    touchEndListener,
    turnPrevSlide,
    turnNextSlide,
    turnSlideToIndex,
    turnSlideToId,
    execPrev,
    execNext,
    animationIndex,
  };
};
