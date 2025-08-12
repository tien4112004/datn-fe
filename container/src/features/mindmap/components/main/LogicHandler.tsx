import { memo, useMemo } from 'react';
import { useMindmapActions, useShortcuts } from '../../hooks';
import { useClipboardStore } from '../../stores';

const LogicHandler = memo(() => {
  const {
    selectAllNodesAndEdges,
    copySelectedNodesAndEdges,
    pasteClonedNodesAndEdges,
    deleteSelectedNodes,
    deselectAllNodesAndEdges,
  } = useMindmapActions();

  const undo = useClipboardStore((state) => state.undo);
  const redo = useClipboardStore((state) => state.redo);

  const shortcuts = useMemo(
    () => [
      {
        key: 'Ctrl+A',
        callback: selectAllNodesAndEdges,
      },
      {
        key: 'Ctrl+C',
        callback: copySelectedNodesAndEdges,
      },
      {
        key: 'Ctrl+V',
        callback: pasteClonedNodesAndEdges,
      },
      {
        key: 'Delete',
        callback: deleteSelectedNodes,
      },
      {
        key: 'Escape',
        callback: deselectAllNodesAndEdges,
      },
      {
        key: 'Ctrl+Z',
        callback: undo,
      },
      {
        key: 'Ctrl+Y',
        callback: redo,
      },
      {
        key: 'Ctrl+Shift+Z',
        callback: redo,
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
