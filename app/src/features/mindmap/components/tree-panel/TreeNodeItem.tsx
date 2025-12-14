import { Button } from '@/shared/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useCoreStore, useTreePanelStore } from '../../stores';
import { useTreeSelectionSync } from '../../hooks/useTreeSync';
import { TreeNodeContent } from './TreeNodeContent';
import { TreeNodeActions } from './TreeNodeActions';
import type { TreeNode } from '../../services/treeBuilder';

interface TreeNodeItemProps {
  treeNode: TreeNode;
  depth: number;
}

export const TreeNodeItem = ({ treeNode, depth }: TreeNodeItemProps) => {
  const { node, children } = treeNode;
  const hasChildren = children.length > 0;

  const { isSelected, nodeRef } = useTreeSelectionSync(node.id);
  const isCollapsed = useTreePanelStore((state) => state.collapsedNodes.has(node.id));
  const toggleCollapse = useTreePanelStore((state) => state.toggleNodeCollapse);
  const setNodes = useCoreStore((state) => state.setNodes);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.map((n) => ({ ...n, selected: n.id === node.id })));
  };

  return (
    <div className="space-y-1" ref={nodeRef}>
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-1 rounded p-1.5 transition-colors hover:bg-gray-100',
          isSelected && 'border border-blue-300 bg-blue-50 hover:bg-blue-100'
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 flex-shrink-0 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        <TreeNodeContent node={node} />
        <TreeNodeActions node={node} />
      </div>

      {!isCollapsed && hasChildren && (
        <div className="space-y-1">
          {children.map((child) => (
            <TreeNodeItem key={child.node.id} treeNode={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
