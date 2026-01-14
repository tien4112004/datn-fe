import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import usePasteTextClipboardData from './usePasteTextClipboardData';
import usePasteDataTransfer from './usePasteDataTransfer';

export default () => {
  const { editorAreaFocus, thumbnailsFocus, disableHotkeys } = storeToRefs(useMainStore());

  const { pasteTextClipboardData } = usePasteTextClipboardData();
  const { pasteDataTransfer } = usePasteDataTransfer();

  /**
   * Paste event listener
   * @param e ClipboardEvent
   */
  const pasteListener = async (e: ClipboardEvent) => {
    if (!editorAreaFocus.value && !thumbnailsFocus.value) return;
    if (disableHotkeys.value) return;

    if (!e.clipboardData) return;

    const { isFile, dataTransferFirstItem } = await pasteDataTransfer(e.clipboardData);
    if (isFile) return;

    // If there is no valid file in the clipboard, but there is text content, try to parse the text content
    if (
      dataTransferFirstItem &&
      dataTransferFirstItem.kind === 'string' &&
      dataTransferFirstItem.type === 'text/plain'
    ) {
      dataTransferFirstItem.getAsString((text) => pasteTextClipboardData(text));
    }
  };

  onMounted(() => {
    document.addEventListener('paste', pasteListener);
  });
  onUnmounted(() => {
    document.removeEventListener('paste', pasteListener);
  });
};
