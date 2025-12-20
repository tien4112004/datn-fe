import { memo, useMemo } from 'react';
import { useMindmapActions, useShortcuts } from '../../hooks';
import { useUndoRedoStore } from '../../stores/undoredo';
import { useSaveMindmap } from '../../hooks/useSaving';

interface LogicHandlerProps {
  mindmapId: string;
  isReadOnly?: boolean;
}

const LogicHandler = memo(({ mindmapId, isReadOnly = false }: LogicHandlerProps) => {
  const { selectAllHandler, copyHandler, pasteHandler, deleteHandler, deselectAllHandler } =
    useMindmapActions();

  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);

  const { saveWithThumbnail } = useSaveMindmap();

  const handleSave = async () => {
    await saveWithThumbnail(mindmapId);
  };

  const allShortcuts = useMemo(
    () => [
      {
        shortcutKey: 'Ctrl+A',
        onKeyPressed: selectAllHandler,
        disabled: isReadOnly,
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
        disabled: isReadOnly,
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
        disabled: isReadOnly,
      },
      {
        shortcutKey: 'Delete',
        onKeyPressed: deleteHandler,
        disabled: isReadOnly,
      },
      {
        shortcutKey: 'Escape',
        onKeyPressed: deselectAllHandler,
        disabled: false,
      },
      {
        shortcutKey: 'Ctrl+Z',
        onKeyPressed: undo,
        disabled: isReadOnly,
      },
      {
        shortcutKey: 'Ctrl+Y',
        onKeyPressed: redo,
        disabled: isReadOnly,
      },
      {
        shortcutKey: 'Ctrl+Shift+Z',
        onKeyPressed: redo,
        disabled: isReadOnly,
      },
      {
        shortcutKey: 'Ctrl+S',
        onKeyPressed: handleSave,
        disabled: false,
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
    [
      selectAllHandler,
      copyHandler,
      pasteHandler,
      deleteHandler,
      deselectAllHandler,
      undo,
      redo,
      handleSave,
      isReadOnly,
    ]
  );

  const shortcuts = useMemo(() => allShortcuts.filter((shortcut) => !shortcut.disabled), [allShortcuts]);

  useShortcuts(shortcuts);

  return null;
});

export default LogicHandler;
