import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useClipboardStore } from '../stores/clipboard';
import type { MindmapActionsType } from '../types';
import { useCoreStore, useNodeOperationsStore } from '../stores';

/**
 * Hook that provides action functions for mindmap operations.
 * Contains the actual implementations of mindmap action methods for cleaner separation of concerns.
 */
export const useMindmapActions = (): MindmapActionsType => {
  const { screenToFlowPosition } = useReactFlow();

  // Clipboard store methods
  const clipboardCopySelectedNodesAndEdges = useClipboardStore((state) => state.copyToClipboard);
  const clipboardPasteClonedNodesAndEdges = useClipboardStore((state) => state.pasteFromClipboard);
  const selectAllNodesAndEdges = useCoreStore((state) => state.selectAllNodesAndEdges);
  const deselectAllNodesAndEdges = useCoreStore((state) => state.deselectAllNodesAndEdges);

  const deleteHandler = useNodeOperationsStore((state) => state.finalizeNodeDeletion);

  return {
    selectAllHandler: selectAllNodesAndEdges,
    deselectAllHandler: deselectAllNodesAndEdges,
    copyHandler: clipboardCopySelectedNodesAndEdges,
    pasteHandler: useCallback(
      () => clipboardPasteClonedNodesAndEdges(screenToFlowPosition),
      [clipboardPasteClonedNodesAndEdges, screenToFlowPosition]
    ),
    deleteHandler,
  };
};
