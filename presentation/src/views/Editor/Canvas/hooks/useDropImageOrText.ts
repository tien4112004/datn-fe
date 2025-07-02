import { onMounted, onUnmounted, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import { getImageDataURL } from '@/utils/image';
import { parseText2Paragraphs } from '@/utils/textParser';
import useCreateElement from '@/hooks/useCreateElement';

export default (elementRef: Ref<HTMLElement | undefined>) => {
  const { disableHotkeys } = storeToRefs(useMainStore());

  const { createImageElement, createTextElement } = useCreateElement();

  // Drag elements onto the canvas
  const handleDrop = (e: DragEvent) => {
    if (!e.dataTransfer || e.dataTransfer.items.length === 0) return;

    const dataItems = e.dataTransfer.items;
    const dataTransferFirstItem = dataItems[0];

    // Check whether the event object contains an image; if so, insert the image. Otherwise, check whether it contains text; if so, insert the text
    let isImage = false;
    for (const item of dataItems) {
      if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
        const imageFile = item.getAsFile();
        if (imageFile) {
          getImageDataURL(imageFile).then((dataURL) => createImageElement(dataURL));
        }
        isImage = true;
      }
    }

    if (isImage) return;

    if (dataTransferFirstItem.kind === 'string' && dataTransferFirstItem.type === 'text/plain') {
      dataTransferFirstItem.getAsString((text) => {
        if (disableHotkeys.value) return;
        const string = parseText2Paragraphs(text);
        createTextElement(
          {
            left: 0,
            top: 0,
            width: 600,
            height: 50,
          },
          { content: string }
        );
      });
    }
  };

  onMounted(() => {
    elementRef.value && elementRef.value.addEventListener('drop', handleDrop);

    document.ondragleave = (e) => e.preventDefault();
    document.ondrop = (e) => e.preventDefault();
    document.ondragenter = (e) => e.preventDefault();
    document.ondragover = (e) => e.preventDefault();
  });
  onUnmounted(() => {
    elementRef.value && elementRef.value.removeEventListener('drop', handleDrop);

    document.ondragleave = null;
    document.ondrop = null;
    document.ondragenter = null;
    document.ondragover = null;
  });
};
