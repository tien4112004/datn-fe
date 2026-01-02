import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useTreeSelectionSync } from '../../hooks/useTreeSync';
import type { TreeNode } from '../../services/treeBuilder';
import { useCoreStore, useTreePanelStore } from '../../stores';
import { TreeNodeActions } from './TreeNodeActions';
import { TreeNodeContent } from './TreeNodeContent';

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
  const hoveredNodeId = useTreePanelStore((state) => state.hoveredNodeId);
  const setHoveredNodeId = useTreePanelStore((state) => state.setHoveredNodeId);
  const setNodes = useCoreStore((state) => state.setNodes);
  const actionsContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showActions = hoveredNodeId === node.id;

  const handleSelect = useCallback(() => {
    setNodes((nodes) => nodes.map((n) => ({ ...n, selected: n.id === node.id })));
  }, [node.id, setNodes]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredNodeId(node.id);
  };

  const handleMouseLeave = () => {
    // Delay hiding to allow hovering over the actions
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(null);
    }, 0);
  };

  const handleActionsHoverChange = (isHovered: boolean) => {
    if (isHovered) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setHoveredNodeId(node.id);
    } else {
      handleMouseLeave();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Clear hovered state if this node was hovered
      if (hoveredNodeId === node.id) {
        setHoveredNodeId(null);
      }
    };
  }, [hoveredNodeId, node.id, setHoveredNodeId]);

  return (
    <div className="min-w-0 space-y-1" ref={nodeRef}>
      <div
        className={cn(
          'group relative min-w-0 rounded-md p-1.5 transition-colors hover:bg-gray-100',
          isSelected && 'border border-blue-300 bg-blue-50 hover:bg-blue-100'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={actionsContainerRef} className="absolute left-0 top-1/2 -translate-y-1/2">
          {showActions && (
            <TreeNodeActions
              node={node}
              containerRef={actionsContainerRef}
              onHoverChange={handleActionsHoverChange}
            />
          )}
        </div>

        {/* Single row: Chevron + Content */}
        <div className="relative flex min-w-0 cursor-pointer items-center gap-1.5 overflow-hidden">
          {/* Indent based on depth */}
          <div style={{ width: `${depth * 16}px` }} className="flex-shrink-0" />

          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 flex-shrink-0 p-0 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}

          <TreeNodeContent node={node} onSelect={handleSelect} />
        </div>
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
