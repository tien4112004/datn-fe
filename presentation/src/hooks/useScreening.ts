import { useScreenStore, useSlidesStore } from '@/store';
import { enterFullscreen, exitFullscreen, isFullscreen } from '@/utils/fullscreen';

export default () => {
  const screenStore = useScreenStore();
  const slidesStore = useSlidesStore();

  // Enter presentation mode (start from current slide)
  const enterScreening = () => {
    document.dispatchEvent(new CustomEvent('hideSidebar', {}));
    enterFullscreen();
    screenStore.setScreening(true);
  };

  // Enter presentation mode (start from first slide)
  const enterScreeningFromStart = () => {
    document.dispatchEvent(new CustomEvent('hideSidebar', {}));
    slidesStore.updateSlideIndex(0);
    enterScreening();
  };

  // Exit presentation mode
  const exitScreening = () => {
    screenStore.setScreening(false);
    if (isFullscreen()) exitFullscreen();
  };

  return {
    enterScreening,
    enterScreeningFromStart,
    exitScreening,
  };
};
