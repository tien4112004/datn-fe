import { useMemo } from 'react';
import { useCoreStore } from '../../stores';
import { findAllRootNodes, areNodesEqualForTree } from '../../services/utils';
import { TreeView } from './TreeView';
import { useTreeKeyboardShortcuts } from '../../hooks/useTreeKeyboardShortcuts';
import { ScrollArea } from '@ui/scroll-area';

export const TreePanelContent = () => {
  // Use custom equality check to prevent list rebuilds on selection
  const nodes = (useCoreStore as any)((state: any) => state.nodes, areNodesEqualForTree);
  const rootNodes = useMemo(() => findAllRootNodes(nodes), [nodes]);
  // Activate keyboard shortcuts when tree tab is active
  useTreeKeyboardShortcuts();

  if (rootNodes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-gray-500">No nodes yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full p-2">
      <div className="max-w-full space-y-4">
        {rootNodes.map((rootNode) => (
          <TreeView key={rootNode.id} rootNode={rootNode} />
        ))}
      </div>
    </ScrollArea>
  );
};
