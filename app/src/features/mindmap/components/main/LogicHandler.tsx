import { useReactFlow } from '@xyflow/react';
import { memo, useEffect, useMemo } from 'react';
import { useMindmapActions, useShortcuts } from '../../hooks';
import { useSaveMindmap } from '../../hooks/useSaving';
import { useUndoRedoStore } from '../../stores/undoredo';
import type { MindmapMetadata } from '../../types';
import { useMindmapPermissionContext } from '../../contexts/MindmapPermissionContext';

interface LogicHandlerProps {
  mindmapId: string;
  isPresenterMode?: boolean;
  metadata?: MindmapMetadata;
}

const LogicHandler = memo(({ mindmapId, isPresenterMode = false, metadata }: LogicHandlerProps) => {
  const { selectAllHandler, copyHandler, pasteHandler, deleteHandler, deselectAllHandler } =
    useMindmapActions();
  const { setViewport } = useReactFlow();

  const undo = useUndoRedoStore((state) => state.undo);
  const redo = useUndoRedoStore((state) => state.redo);

  const { saveWithThumbnail } = useSaveMindmap();

  // Get read-only state from permission context (single source of truth)
  const { isReadOnly } = useMindmapPermissionContext();

  // Restore viewport from metadata on mount
  useEffect(() => {
    if (metadata?.viewport) {
      setViewport(metadata.viewport, { duration: 0 });
    }
  }, [metadata, setViewport]);

  const handleSave = async () => {
    await saveWithThumbnail(mindmapId);
  };

  const allShortcuts = useMemo(
    () => [
      {
        shortcutKey: 'Ctrl+A',
        onKeyPressed: selectAllHandler,
        disabled: isPresenterMode,
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
        disabled: isPresenterMode,
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
        disabled: isReadOnly, // Disable save when read-only (no edit permission or presenter mode)
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
