import { useMemo } from 'react';
import { useCoreStore } from '../../stores';
import { findAllRootNodes } from '../../services/utils';
import { TreeView } from './TreeView';

export const TreePanelContent = () => {
  const nodes = useCoreStore((state) => state.nodes);
  const rootNodes = useMemo(() => findAllRootNodes(nodes), [nodes]);

  if (rootNodes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-gray-500">No nodes yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-auto p-4">
      {rootNodes.map((rootNode) => (
        <TreeView key={rootNode.id} rootNode={rootNode} />
      ))}
    </div>
  );
};
