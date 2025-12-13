import { Button } from '@/shared/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { useCoreStore, useNodeOperationsStore } from '../../stores';
import { SIDE } from '../../types';
import type { MindMapNode } from '../../types';

interface TreeNodeActionsProps {
  node: MindMapNode;
}

export const TreeNodeActions = ({ node }: TreeNodeActionsProps) => {
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);
  const markNodeForDeletion = useNodeOperationsStore((state) => state.markNodeForDeletion);
  const setNodes = useCoreStore((state) => state.setNodes);

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Inherit side from parent, or default to RIGHT for root nodes
    const side = node.data.side === SIDE.MID ? SIDE.RIGHT : node.data.side;
    addChildNode(node, { x: 0, y: 0 }, side || SIDE.RIGHT);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Select node first, then mark for deletion
    setNodes((nodes) => nodes.map((n) => ({ ...n, selected: n.id === node.id })));
    markNodeForDeletion();
  };

  return (
    <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0"
        onClick={handleAddChild}
        title="Add child node"
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 hover:text-red-600"
        onClick={handleDelete}
        title="Delete node"
      >
        <Trash className="h-3 w-3" />
      </Button>
    </div>
  );
};
