import { memo, useMemo } from 'react';
import { useMindmapActions, useShortcuts } from '../../hooks';
import { useUndoRedoStore } from '../../stores/undoredo';

const LogicHandler = memo(() => {
  const { selectAllHandler, copyHandler, pasteHandler, deleteHandler, deselectAllHandler } =
    useMindmapActions();

  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);

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
    ],
    [selectAllHandler, copyHandler, pasteHandler, deleteHandler, deselectAllHandler, undo, redo]
  );

  useShortcuts(shortcuts);

  return null;
});

export default LogicHandler;
