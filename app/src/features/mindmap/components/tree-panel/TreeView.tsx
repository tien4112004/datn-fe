import { useMemo } from 'react';
import { useCoreStore } from '../../stores';
import { buildTreeFromFlat } from '../../services/treeBuilder';
import { TreeNodeItem } from './TreeNodeItem';
import { areNodesEqualForTree } from '../../services/utils';
import type { RootNode } from '../../types';

interface TreeViewProps {
  rootNode: RootNode;
}

export const TreeView = ({ rootNode }: TreeViewProps) => {
  // Use custom equality check to ignore selection changes
  const nodes = (useCoreStore as any)((state: any) => state.nodes, areNodesEqualForTree);
  const tree = useMemo(() => buildTreeFromFlat(rootNode, nodes), [rootNode, nodes]);

  return (
    <div className="max-w-full overflow-x-hidden rounded border border-gray-200 bg-white p-1">
      <TreeNodeItem treeNode={tree} depth={0} />
    </div>
  );
};
