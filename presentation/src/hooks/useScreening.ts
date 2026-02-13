import { storeToRefs } from 'pinia';
import { useScreenStore, useSlidesStore } from '@/store';
import { enterFullscreen, exitFullscreen, isFullscreen } from '@/utils/fullscreen';
import message from '@/utils/message';
import { useI18n } from 'vue-i18n';

export default () => {
  const screenStore = useScreenStore();
  const slidesStore = useSlidesStore();
  const { slides } = storeToRefs(slidesStore);
  const { t } = useI18n();

  // Enter presentation mode (start from current slide)
  const enterScreening = () => {
    if (slides.value.length === 0) {
      message.warning(t('emptyState.cannotPresent'));
      return;
    }
    document.dispatchEvent(new CustomEvent('enableFullscreen', {}));
    enterFullscreen();
    screenStore.setScreening(true);
    screenStore.setPresenter(false);
  };

  const enterPresenterMode = () => {
    if (slides.value.length === 0) {
      message.warning(t('emptyState.cannotPresent'));
      return;
    }
    document.dispatchEvent(new CustomEvent('enableFullscreen', {}));
    enterFullscreen();
    screenStore.setScreening(true);
    screenStore.setPresenter(true);
  };

  // Enter presentation mode (start from first slide)
  const enterScreeningFromStart = () => {
    if (slides.value.length === 0) {
      message.warning(t('emptyState.cannotPresent'));
      return;
    }
    document.dispatchEvent(new CustomEvent('enableFullscreen', {}));
    slidesStore.updateSlideIndex(0);
    enterFullscreen();
    screenStore.setScreening(true);
    screenStore.setPresenter(false);
  };

  // Open presentation in a new window/tab
  const openSeparatedPresentation = () => {
    const currentUrl = window.location.href;
    const screeningUrl = currentUrl.includes('?')
      ? `${currentUrl}&screening=true`
      : `${currentUrl}?screening=true`;
    window.open(screeningUrl, '_blank', 'width=1920,height=1080');
  };

  // Exit presentation mode
  const exitScreening = () => {
    document.dispatchEvent(new CustomEvent('disableFullscreen', {}));
    screenStore.setScreening(false);
    if (isFullscreen()) exitFullscreen();
  };

  return {
    enterScreening,
    enterScreeningFromStart,
    exitScreening,
    enterPresenterMode,
    openSeparatedPresentation,
  };
};
