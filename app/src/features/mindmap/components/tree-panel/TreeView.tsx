import { useMemo } from 'react';
import { useCoreStore } from '../../stores';
import { buildTreeFromFlat } from '../../services/treeBuilder';
import { TreeNodeItem } from './TreeNodeItem';
import type { RootNode } from '../../types';

interface TreeViewProps {
  rootNode: RootNode;
}

export const TreeView = ({ rootNode }: TreeViewProps) => {
  const nodes = useCoreStore((state) => state.nodes);
  const tree = useMemo(() => buildTreeFromFlat(rootNode, nodes), [rootNode, nodes]);

  return (
    <div className="max-w-full overflow-x-hidden rounded border border-gray-200 bg-white p-1">
      <TreeNodeItem treeNode={tree} depth={0} />
    </div>
  );
};
