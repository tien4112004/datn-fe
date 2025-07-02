import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { nanoid } from 'nanoid';
import { useMainStore, useSlidesStore } from '@/store';
import type { Slide } from '@/types/slides';
import { copyText, readClipboard } from '@/utils/clipboard';
import { encrypt } from '@/utils/crypto';
import { createElementIdMap } from '@/utils/element';
import { KEYS } from '@/configs/hotkey';
import message from '@/utils/message';
import usePasteTextClipboardData from '@/hooks/usePasteTextClipboardData';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements';

export default () => {
  const mainStore = useMainStore();
  const slidesStore = useSlidesStore();
  const { selectedSlidesIndex: _selectedSlidesIndex, activeElementIdList } = storeToRefs(mainStore);
  const { currentSlide, slides, theme, slideIndex } = storeToRefs(slidesStore);

  const selectedSlidesIndex = computed(() => [..._selectedSlidesIndex.value, slideIndex.value]);
  const selectedSlides = computed(() =>
    slides.value.filter((item, index) => selectedSlidesIndex.value.includes(index))
  );
  const selectedSlidesId = computed(() => selectedSlides.value.map((item) => item.id));

  const { pasteTextClipboardData } = usePasteTextClipboardData();
  const { addSlidesFromData } = useAddSlidesOrElements();
  const { addHistorySnapshot } = useHistorySnapshot();

  // Reset slides
  const resetSlides = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.value.backgroundColor,
      },
    };
    slidesStore.updateSlideIndex(0);
    mainStore.setActiveElementIdList([]);
    slidesStore.setSlides([emptySlide]);
  };

  /**
   * Move page focus
   * @param command Move page focus command: up, down
   */
  const updateSlideIndex = (command: string) => {
    if (command === KEYS.UP && slideIndex.value > 0) {
      if (activeElementIdList.value.length) mainStore.setActiveElementIdList([]);
      slidesStore.updateSlideIndex(slideIndex.value - 1);
    } else if (command === KEYS.DOWN && slideIndex.value < slides.value.length - 1) {
      if (activeElementIdList.value.length) mainStore.setActiveElementIdList([]);
      slidesStore.updateSlideIndex(slideIndex.value + 1);
    }
  };

  // Encrypt current page data and copy to clipboard
  const copySlide = () => {
    const text = encrypt(
      JSON.stringify({
        type: 'slides',
        data: selectedSlides.value,
      })
    );

    copyText(text).then(() => {
      mainStore.setThumbnailsFocus(true);
    });
  };

  // Try to decrypt clipboard page data and add to next page (paste)
  const pasteSlide = () => {
    readClipboard()
      .then((text) => {
        pasteTextClipboardData(text, { onlySlide: true });
      })
      .catch((err) => message.warning(err));
  };

  // Create a blank page and add to next page
  const createSlide = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.value.backgroundColor,
      },
    };
    mainStore.setActiveElementIdList([]);
    slidesStore.addSlide(emptySlide);
    addHistorySnapshot();
  };

  // Create new page based on template
  const createSlideByTemplate = (slide: Slide) => {
    const { groupIdMap, elIdMap } = createElementIdMap(slide.elements);

    for (const element of slide.elements) {
      element.id = elIdMap[element.id];
      if (element.groupId) element.groupId = groupIdMap[element.groupId];
    }
    const newSlide = {
      ...slide,
      id: nanoid(10),
    };
    mainStore.setActiveElementIdList([]);
    slidesStore.addSlide(newSlide);
    addHistorySnapshot();
  };

  // Copy current page to next page
  const copyAndPasteSlide = () => {
    const slide = JSON.parse(JSON.stringify(currentSlide.value));
    addSlidesFromData([slide]);
  };

  // Delete current page, if all pages will be deleted, execute reset slides operation
  const deleteSlide = (targetSlidesId = selectedSlidesId.value) => {
    if (slides.value.length === targetSlidesId.length) resetSlides();
    else slidesStore.deleteSlide(targetSlidesId);

    mainStore.updateSelectedSlidesIndex([]);

    addHistorySnapshot();
  };

  // Copy current page then delete (cut)
  // Since copy operation will cause multi-select state to disappear, we need to cache the page IDs to be deleted in advance
  const cutSlide = () => {
    const targetSlidesId = [...selectedSlidesId.value];
    copySlide();
    deleteSlide(targetSlidesId);
  };

  // Select all slides
  const selectAllSlide = () => {
    const newSelectedSlidesIndex = Array.from(Array(slides.value.length), (item, index) => index);
    mainStore.setActiveElementIdList([]);
    mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex);
  };

  // Drag to adjust slide order and sync data
  const sortSlides = (newIndex: number, oldIndex: number) => {
    if (oldIndex === newIndex) return;

    const _slides: Slide[] = JSON.parse(JSON.stringify(slides.value));

    const movingSlide = _slides[oldIndex];
    const movingSlideSection = movingSlide.sectionTag;
    if (movingSlideSection) {
      const movingSlideSectionNext = _slides[oldIndex + 1];
      delete movingSlide.sectionTag;
      if (movingSlideSectionNext && !movingSlideSectionNext.sectionTag) {
        movingSlideSectionNext.sectionTag = movingSlideSection;
      }
    }
    if (newIndex === 0) {
      const firstSection = _slides[0].sectionTag;
      if (firstSection) {
        delete _slides[0].sectionTag;
        movingSlide.sectionTag = firstSection;
      }
    }

    const _slide = _slides[oldIndex];
    _slides.splice(oldIndex, 1);
    _slides.splice(newIndex, 0, _slide);
    slidesStore.setSlides(_slides);
    slidesStore.updateSlideIndex(newIndex);
  };

  const isEmptySlide = computed(() => {
    if (slides.value.length > 1) return false;
    if (slides.value[0].elements.length > 0) return false;
    return true;
  });

  return {
    resetSlides,
    updateSlideIndex,
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
  };
};
