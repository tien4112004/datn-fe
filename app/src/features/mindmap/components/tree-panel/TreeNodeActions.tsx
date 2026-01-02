import { Button } from '@/shared/components/ui/button';
import { CornerDownRight, Plus, Trash } from 'lucide-react';
import { useCoreStore, useNodeOperationsStore } from '../../stores';
import type { MindMapNode } from '../../types';
import { SIDE } from '../../types';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface TreeNodeActionsProps {
  node: MindMapNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHoverChange?: (isHovered: boolean) => void;
}

export const TreeNodeActions = ({ node, containerRef, onHoverChange }: TreeNodeActionsProps) => {
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);
  const addNode = useNodeOperationsStore((state) => state.addNode);
  const deleteNodesInstant = useNodeOperationsStore((state) => state.deleteNodesInstant);
  const setNodes = useCoreStore((state) => state.setNodes);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Inherit side from parent, or default to RIGHT for root nodes
    const side = node.data.side === SIDE.MID ? SIDE.RIGHT : node.data.side;
    addChildNode(node, { x: 0, y: 0 }, side || SIDE.RIGHT);
  };

  const handleAddSibling = (e: React.MouseEvent) => {
    e.stopPropagation();

    const { nodes, edges } = useCoreStore.getState();
    const parentEdge = edges.find((edge) => edge.target === node.id);

    if (!parentEdge) {
      // Root node - add another root
      addNode({ content: 'New Root', position: { x: node.position.x + 300, y: node.position.y } });
      return;
    }

    const parentNode = nodes.find((n) => n.id === parentEdge.source);
    if (!parentNode) return;

    const side = node.data.side;
    addChildNode(parentNode, { x: 0, y: 0 }, side || SIDE.RIGHT);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Select node first, then delete instantly
    setNodes((nodes) => nodes.map((n) => ({ ...n, selected: n.id === node.id })));
    deleteNodesInstant();
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const updatePosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.left,
      });
    };

    updatePosition();

    // Update position on scroll or resize
    const scrollContainer = containerRef.current.closest('.overflow-auto');
    scrollContainer?.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      scrollContainer?.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [containerRef]);

  const actionsContent = (
    <div
      key={node.id}
      className="pointer-events-auto fixed z-50 flex gap-0.5 rounded-md bg-white p-1 shadow-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-100%, -50%)',
      }}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-700"
        onClick={handleAddChild}
        title="Add child node (Tab/Enter)"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
        onClick={handleAddSibling}
        title="Add sibling node (Ctrl+Enter)"
      >
        <CornerDownRight className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
        onClick={handleDelete}
        title="Delete node (Delete/Backspace)"
      >
        <Trash className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return createPortal(actionsContent, document.body);
};
