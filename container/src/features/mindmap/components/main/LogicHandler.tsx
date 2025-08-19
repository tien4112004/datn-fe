import { memo, useMemo } from 'react';
import { useMindmapActions, useShortcuts } from '../../hooks';
import { useMindmapStore } from '../../stores';

const LogicHandler = memo(() => {
  const {
    selectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
    deselectAllNodesAndEdges,
  } = useMindmapActions();

  const undo = useMindmapStore((state) => state.undo);
  const redo = useMindmapStore((state) => state.redo);

  const shortcuts = useMemo(
    () => [
      {
        shortcutKey: 'Ctrl+A',
        onKeyPressed: selectAllNodesAndEdges,
        shouldExecute: () => {
          const activeElement = document.activeElement as HTMLElement;
          navigator.clipboard.readText().then((text) => {
            console.log('Clipboard content:', text);
          });
          return (
            activeElement.tagName !== 'INPUT' &&
            activeElement.tagName !== 'TEXTAREA' &&
            !activeElement.classList.contains('bn-editor')
          );
        },
      },
      {
        shortcutKey: 'Ctrl+C',
        onKeyPressed: copySelectedNodesAndEdges,
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
        onKeyPressed: pasteClonedNodesAndEdges,
      },
      {
        shortcutKey: 'Delete',
        onKeyPressed: deleteSelectedNodes,
      },
      {
        shortcutKey: 'Escape',
        onKeyPressed: deselectAllNodesAndEdges,
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
    [
      selectAllNodesAndEdges,
      copySelectedNodesAndEdges,
      pasteClonedNodesAndEdges,
      deleteSelectedNodes,
      deselectAllNodesAndEdges,
      undo,
      redo,
    ]
  );

  useShortcuts(shortcuts);

  return null;
});

export default LogicHandler;
