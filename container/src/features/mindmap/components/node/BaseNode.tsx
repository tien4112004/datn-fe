import { type ReactNode, type HTMLAttributes, useCallback, memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/shared/lib/utils';
import type { Direction, MindMapNode } from '@/features/mindmap/types';
import { NodeResizer, type NodeProps } from '@xyflow/react';
import { DRAGHANDLE } from '@/features/mindmap/types';
import { useShallow } from 'zustand/react/shallow';

import { useMindmapNodeCommon } from '@/features/mindmap/hooks';
import { useClipboardStore, useCoreStore } from '@/features/mindmap/stores';
import { CreateChildNodeButtons, NodeHandlers } from '../controls/CreateChildNodeButtons';

export interface BaseNodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  node: NodeProps<MindMapNode>;
  variant?: 'card' | 'replacing';
}

// Optimized store selectors
const clipboardSelector = (state: any) => state.dragTargetNodeId;

export const BaseNodeBlock = memo(
  ({ className, children, variant = 'card', node, ...props }: BaseNodeBlockProps) => {
    const { id, data, width, height, selected, dragging } = node;
    const dragTargetNodeId = useClipboardStore(useShallow(clipboardSelector));
    const isDragTarget = dragTargetNodeId === id;

    const { layout, isLayouting, onNodeDelete } = useMindmapNodeCommon<MindMapNode>({
      node,
    });

    const handleAnimationComplete = useCallback(() => {
      if (data.isDeleting && onNodeDelete) {
        onNodeDelete(id);
      }
    }, [data.isDeleting, onNodeDelete, id]);

    const baseStyles = cn(isDragTarget && 'drag-target', DRAGHANDLE.CLASS);

    const cardStyles = cn(
      'base-node-card',
      isLayouting && 'layouting',
      isDragTarget && 'drag-target',
      className
    );

    // Memoized animation configurations
    const animationConfig = useMemo(
      () => ({
        initial: { opacity: 0, scale: 0 },
        animate:
          data && data.isDeleting
            ? { opacity: 0, scale: 0 }
            : data.isCollapsed
              ? { opacity: 0, scale: 0.8 }
              : { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0 },
        transition: {
          duration: data?.isCollapsed ? 0.2 : 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: 'tween',
        },
      }),
      [data?.isDeleting, data?.isCollapsed]
    );

    // Memoized style objects
    const nodeStyle = useMemo(
      () => ({
        width: width ? `${width}px` : undefined,
        minHeight: height ? `${height}px` : undefined,
        ...props.style,
      }),
      [width, height, props.style]
    );

    return (
      <AnimatePresence>
        <motion.div
          key={id}
          style={nodeStyle}
          {...animationConfig}
          onAnimationComplete={handleAnimationComplete}
          className={cn(variant === 'card' ? cardStyles : baseStyles, className)}
          {...props}
        >
          {children}
          <NodeHandlers layout={layout} id={id} side={data.side} />
          <Helper node={node} layout={layout} dragging={dragging} selected={selected} />
        </motion.div>
      </AnimatePresence>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.node.data === nextProps.node.data &&
      prevProps.className === nextProps.className &&
      prevProps.variant === nextProps.variant &&
      prevProps.children === nextProps.children
    );
  }
);

const Helper = memo(
  ({
    node,
    layout,
    dragging,
    selected,
  }: {
    node: NodeProps<MindMapNode>;
    layout: Direction;
    dragging: boolean;
    selected: boolean;
  }) => {
    const selectedNodeCount = useCoreStore((state) => state.selectedNodeIds.size);
    if (selectedNodeCount > 1 || dragging) {
      return null;
    }

    return (
      <>
        <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />
        <CreateChildNodeButtons node={node} layout={layout} selected={selected} />
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.layout === nextProps.layout &&
      prevProps.selected === nextProps.selected &&
      prevProps.dragging === nextProps.dragging
    );
  }
);
