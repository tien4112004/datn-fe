import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import type { CreateElementSelectionData } from '@/types/edit';
import useCreateElement from '@/hooks/useCreateElement';

export default (viewportRef: Ref<HTMLElement | undefined>) => {
  const mainStore = useMainStore();
  const { canvasScale, creatingElement } = storeToRefs(mainStore);

  // Calculate the position and size of the selection area based on the start and end points during mouse selection
  const formatCreateSelection = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData;

    if (!viewportRef.value) return;
    const viewportRect = viewportRef.value.getBoundingClientRect();

    const [startX, startY] = start;
    const [endX, endY] = end;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const left = (minX - viewportRect.x) / canvasScale.value;
    const top = (minY - viewportRect.y) / canvasScale.value;
    const width = (maxX - minX) / canvasScale.value;
    const height = (maxY - minY) / canvasScale.value;

    return { left, top, width, height };
  };

  // Calculate the position and endpoints of the line on the canvas based on the start and end points during mouse selection
  const formatCreateSelectionForLine = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData;

    if (!viewportRef.value) return;
    const viewportRect = viewportRef.value.getBoundingClientRect();

    const [startX, startY] = start;
    const [endX, endY] = end;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const left = (minX - viewportRect.x) / canvasScale.value;
    const top = (minY - viewportRect.y) / canvasScale.value;
    const width = (maxX - minX) / canvasScale.value;
    const height = (maxY - minY) / canvasScale.value;

    const _start: [number, number] = [startX === minX ? 0 : width, startY === minY ? 0 : height];
    const _end: [number, number] = [endX === minX ? 0 : width, endY === minY ? 0 : height];

    return {
      left,
      top,
      start: _start,
      end: _end,
    };
  };

  const { createTextElement, createShapeElement, createLineElement } = useCreateElement();

  // Insert elements based on the position and size of the mouse selection area
  const insertElementFromCreateSelection = (selectionData: CreateElementSelectionData) => {
    if (!creatingElement.value) return;

    const type = creatingElement.value.type;
    if (type === 'text') {
      const position = formatCreateSelection(selectionData);
      position && createTextElement(position, { vertical: creatingElement.value.vertical });
    } else if (type === 'shape') {
      const position = formatCreateSelection(selectionData);
      position && createShapeElement(position, creatingElement.value.data);
    } else if (type === 'line') {
      const position = formatCreateSelectionForLine(selectionData);
      position && createLineElement(position, creatingElement.value.data);
    }
    mainStore.setCreatingElement(null);
  };

  return {
    formatCreateSelection,
    insertElementFromCreateSelection,
  };
};
