import { type ReactNode, type HTMLAttributes, useCallback, memo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { Direction, MindMapNode } from '@/features/mindmap/types';
import { NodeResizer, type NodeProps } from '@xyflow/react';
import { DIRECTION, DRAGHANDLE } from '@/features/mindmap/types';

import { useMindmapNodeCommon } from '@/features/mindmap/hooks';
import { useClipboardStore } from '@/features/mindmap/stores';
import { CreateChildNodeButtons, NodeHandlers } from '../controls/CreateChildNodeButtons';

export interface BaseNodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  node: NodeProps<MindMapNode>;
  variant?: 'card' | 'replacing';
}

export const BaseNodeBlock = memo(
  ({ className, children, variant = 'card', node, ...props }: BaseNodeBlockProps) => {
    const { id, data, selected: isSelected, width, height } = node;
    const dragTargetNodeId = useClipboardStore((state) => state.dragTargetNodeId);
    const isDragTarget = dragTargetNodeId === id;

    const [isMouseOver, setIsMouseOver] = useState(false);

    const { layout, isLayouting, onNodeDelete } = useMindmapNodeCommon<MindMapNode>({
      node,
    });

    const handleAnimationComplete = useCallback(() => {
      if (data.isDeleting && onNodeDelete) {
        onNodeDelete(id);
      }
    }, [data.isDeleting, onNodeDelete]);

    const onMouseEnter = useCallback(() => {
      setIsMouseOver(true);
    }, [setIsMouseOver]);

    const onMouseLeave = useCallback(() => {
      setIsMouseOver(false);
    }, [setIsMouseOver]);

    const baseStyles = cn(isDragTarget && 'ring-2 ring-green-400 bg-green-50', DRAGHANDLE.CLASS);

    const cardStyles = cn(
      'bg-card text-card-foreground relative',
      'hover:ring-1',
      '[.react-flow\\_\\_node.selected_&]:border-muted-foreground',
      '[.react-flow\\_\\_node.selected_&]:shadow-lg',
      isLayouting && 'shadow-lg ring-2 ring-blue-300',
      isDragTarget && 'ring-2 ring-green-400 bg-green-50',
      'rounded-md border rounded-lg border-2 shadow-md'
    );

    const NODE_RESIZER_COLOR = '#ff0000';

    return (
      <AnimatePresence>
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            data && data.isDeleting
              ? { opacity: 0, scale: 0 }
              : data.isCollapsed
                ? { opacity: 0, scale: 0.8 }
                : { opacity: 1, scale: 1 }
          }
          exit={{ opacity: 0, scale: 0 }}
          transition={{
            duration: data?.isCollapsed ? 0.2 : 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: 'tween',
          }}
          onAnimationComplete={handleAnimationComplete}
        >
          {variant === 'card' ? (
            <BaseNode
              className={cn(cardStyles, className)}
              style={{
                width: width ? `${width}px` : undefined,
                minHeight: height ? `${height}px` : undefined,
                ...props.style,
              }}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              tabIndex={0}
              {...props}
            >
              {children}
              <NodeResizer color={NODE_RESIZER_COLOR} isVisible={isSelected} minWidth={100} minHeight={30} />
              <NodeHandlers layout={layout} id={id} side={data.side} />
              <CreateChildNodeButtons
                node={node}
                isMouseOver={isMouseOver}
                isSelected={isSelected ?? false}
                layout={layout}
              />
            </BaseNode>
          ) : (
            <div
              className={cn(baseStyles, className)}
              style={{
                width: width ? `${width}px` : undefined,
                minHeight: height ? `${height}px` : undefined,
                ...props.style,
              }}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              tabIndex={0}
              {...props}
            >
              {children}
              <NodeResizer color={NODE_RESIZER_COLOR} isVisible={isSelected} minWidth={100} minHeight={30} />
              <NodeHandlers layout={layout} id={id} side={data.side} />
              <CreateChildNodeButtons
                node={node}
                isMouseOver={isMouseOver}
                isSelected={isSelected ?? false}
                layout={layout}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render BaseNode if these specific properties change
    const prevNode = prevProps.node;
    const nextNode = nextProps.node;

    return (
      prevNode.id === nextNode.id &&
      prevNode.selected === nextNode.selected &&
      prevNode.dragging === nextNode.dragging &&
      prevNode.width === nextNode.width &&
      prevNode.height === nextNode.height &&
      prevNode.data === nextNode.data &&
      prevProps.variant === nextProps.variant
    );
  }
);

interface BaseNodeControlProps {
  layout: Direction;
  isSelected: boolean;
  children: ReactNode;
  spacing?: 'sm' | 'lg';
  padding?: boolean;
}

export const BaseNodeControl = memo(
  ({ layout, isSelected, children, spacing = 'lg', padding = false }: BaseNodeControlProps) => {
    const offset = spacing === 'sm' ? '12px' : '24px';

    return (
      <div
        className={cn(
          layout === DIRECTION.VERTICAL
            ? `right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+${offset})] flex-col`
            : `left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+${offset})] flex-row`,
          'bg-muted absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
          padding && 'p-1',
          isSelected ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        {children}
      </div>
    );
  }
);
