import { memo, useMemo } from 'react';
import { useMindmapActions, useShortcuts } from '../../hooks';
import { useUndoRedoStore } from '../../stores/undoredo';
import { useSaveMindmap } from '../../hooks/useSaveMindmap';

interface LogicHandlerProps {
  mindmapId: string;
}

const LogicHandler = memo(({ mindmapId }: LogicHandlerProps) => {
  const { selectAllHandler, copyHandler, pasteHandler, deleteHandler, deselectAllHandler } =
    useMindmapActions();

  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);

  const { saveWithThumbnail } = useSaveMindmap();

  const handleSave = async () => {
    await saveWithThumbnail(mindmapId);
  };

  const shortcuts = useMemo(
    () => [
      {
        shortcutKey: 'Ctrl+A',
        onKeyPressed: selectAllHandler,
        shouldExecute: () => {
          const activeElement = document.activeElement as HTMLElement;

          return (
            activeElement.tagName !== 'INPUT' &&
            activeElement.tagName !== 'TEXTAREA' &&
            !activeElement.classList.contains('bn-editor')
          );
        },
      },
      {
        shortcutKey: 'Ctrl+C',
        onKeyPressed: copyHandler,
        shouldExecute: () => {
          const activeElement = document.activeElement as HTMLElement;
          return (
            activeElement.tagName !== 'INPUT' &&
            activeElement.tagName !== 'TEXTAREA' &&
            !activeElement.classList.contains('bn-editor')
          );
        },
      },
      {
        shortcutKey: 'Ctrl+V',
        onKeyPressed: pasteHandler,
      },
      {
        shortcutKey: 'Delete',
        onKeyPressed: deleteHandler,
      },
      {
        shortcutKey: 'Escape',
        onKeyPressed: deselectAllHandler,
      },
      {
        shortcutKey: 'Ctrl+Z',
        onKeyPressed: undo,
      },
      {
        shortcutKey: 'Ctrl+Y',
        onKeyPressed: redo,
      },
      {
        shortcutKey: 'Ctrl+Shift+Z',
        onKeyPressed: redo,
      },
      {
        shortcutKey: 'Ctrl+S',
        onKeyPressed: handleSave,
        shouldExecute: () => {
          const activeElement = document.activeElement as HTMLElement;
          return (
            activeElement.tagName !== 'INPUT' &&
            activeElement.tagName !== 'TEXTAREA' &&
            !activeElement.classList.contains('bn-editor')
          );
        },
      },
    ],
    [selectAllHandler, copyHandler, pasteHandler, deleteHandler, deselectAllHandler, undo, redo, handleSave]
  );

  useShortcuts(shortcuts);

  return null;
});

export default LogicHandler;
