import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import { getImageDataURL } from '@/utils/image';
import usePasteTextClipboardData from './usePasteTextClipboardData';
import useCreateElement from './useCreateElement';

export default () => {
  const { editorAreaFocus, thumbnailsFocus, disableHotkeys } = storeToRefs(useMainStore());

  const { pasteTextClipboardData } = usePasteTextClipboardData();
  const { createImageElement } = useCreateElement();

  // Paste image into slide elements
  /**
   * Paste image file
   * @param imageFile File object of the image
   */
  const pasteImageFile = (imageFile: File) => {
    getImageDataURL(imageFile).then((dataURL) => createImageElement(dataURL));
  };

  /**
   * Paste event listener
   * @param e ClipboardEvent
   */
  const pasteListener = (e: ClipboardEvent) => {
    if (!editorAreaFocus.value && !thumbnailsFocus.value) return;
    if (disableHotkeys.value) return;

    if (!e.clipboardData) return;

    const clipboardDataItems = e.clipboardData.items;
    const clipboardDataFirstItem = clipboardDataItems[0];

    if (!clipboardDataFirstItem) return;

    // If there is an image in the clipboard, try to read the image first
    let isImage = false;
    for (const item of clipboardDataItems) {
      if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
        const imageFile = item.getAsFile();
        if (imageFile) pasteImageFile(imageFile);
        isImage = true;
      }
    }

    if (isImage) return;

    // If there is no image in the clipboard, but there is text content, try to parse the text content
    if (clipboardDataFirstItem.kind === 'string' && clipboardDataFirstItem.type === 'text/plain') {
      clipboardDataFirstItem.getAsString((text) => pasteTextClipboardData(text));
    }
  };

  onMounted(() => {
    document.addEventListener('paste', pasteListener);
  });
  onUnmounted(() => {
    document.removeEventListener('paste', pasteListener);
  });
};
