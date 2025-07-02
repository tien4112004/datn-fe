import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';
import type { PPTElement } from '@/types/slides';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';

export default () => {
  const mainStore = useMainStore();
  const slidesStore = useSlidesStore();
  const { activeElementIdList } = storeToRefs(mainStore);
  const { currentSlide } = storeToRefs(slidesStore);

  const { addHistorySnapshot } = useHistorySnapshot();

  // Lock the selected elements and clear the selected element state
  const lockElement = () => {
    const newElementList: PPTElement[] = JSON.parse(JSON.stringify(currentSlide.value.elements));

    for (const element of newElementList) {
      if (activeElementIdList.value.includes(element.id)) element.lock = true;
    }
    slidesStore.updateSlide({ elements: newElementList });
    mainStore.setActiveElementIdList([]);
    addHistorySnapshot();
  };

  /**
   * Unlock the element and set it as the currently selected element
   * @param handleElement The element to unlock
   */
  const unlockElement = (handleElement: PPTElement) => {
    const newElementList: PPTElement[] = JSON.parse(JSON.stringify(currentSlide.value.elements));

    if (handleElement.groupId) {
      const groupElementIdList = [];
      for (const element of newElementList) {
        if (element.groupId === handleElement.groupId) {
          element.lock = false;
          groupElementIdList.push(element.id);
        }
      }
      slidesStore.updateSlide({ elements: newElementList });
      mainStore.setActiveElementIdList(groupElementIdList);
    } else {
      for (const element of newElementList) {
        if (element.id === handleElement.id) {
          element.lock = false;
          break;
        }
      }
      slidesStore.updateSlide({ elements: newElementList });
      mainStore.setActiveElementIdList([handleElement.id]);
    }
    addHistorySnapshot();
  };

  return {
    lockElement,
    unlockElement,
  };
};
