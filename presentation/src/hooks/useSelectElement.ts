import { storeToRefs } from 'pinia';
import { useMainStore, useSlidesStore } from '@/store';

export default () => {
  const mainStore = useMainStore();
  const { currentSlide } = storeToRefs(useSlidesStore());
  const { hiddenElementIdList, handleElementId } = storeToRefs(mainStore);

  // Set all elements on the current page to selected state
  const selectAllElements = () => {
    const unlockedElements = currentSlide.value.elements.filter(
      (el) => !el.lock && !hiddenElementIdList.value.includes(el.id)
    );
    const newActiveElementIdList = unlockedElements.map((el) => el.id);
    mainStore.setActiveElementIdList(newActiveElementIdList);
  };

  // Set the specified element to selected state
  const selectElement = (id: string) => {
    if (handleElementId.value === id) return;
    if (hiddenElementIdList.value.includes(id)) return;

    const lockedElements = currentSlide.value.elements.filter((el) => el.lock);
    if (lockedElements.some((el) => el.id === id)) return;

    mainStore.setActiveElementIdList([id]);
  };

  return {
    selectAllElements,
    selectElement,
  };
};
