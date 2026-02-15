import type { MindMapNode } from '@/features/mindmap/types';
import { DRAGHANDLE } from '@/features/mindmap/types';
import { DEFAULT_LAYOUT_TYPE } from '../../services/utils';
import { cn } from '@/shared/lib/utils';
import { NodeResizer, type NodeProps } from '@xyflow/react';
import { isEqual } from 'lodash';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useCallback, useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  useClipboardStore,
  useCoreStore,
  useLayoutStore,
  useNodeOperationsStore,
} from '@/features/mindmap/stores';
import { ChildNodeControls, NodeHandlers } from '../controls/ChildNodeControls';

export interface BaseNodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  node: NodeProps<MindMapNode>;
  variant?: 'card' | 'replacing' | 'root';
}

const clipboardSelector = (state: any) => state.dragTargetNodeId;

export const BaseNodeBlock = memo(
  ({ className, children, variant = 'card', node, ...props }: BaseNodeBlockProps) => {
    const { id, data, width, height, selected, dragging } = node;

    const dragTargetNodeId = useClipboardStore(useShallow(clipboardSelector));
    const isDragTarget = dragTargetNodeId === id;

    const isLayouting = useLayoutStore((state) => state.isLayouting);
    const onNodeDelete = useNodeOperationsStore((state) => state.finalizeNodeDeletion);
    const layoutType = useCoreStore((state) => {
      const rootId = state.nodeToRootMap.get(id);
      return (rootId && state.rootLayoutTypeMap.get(rootId)) || DEFAULT_LAYOUT_TYPE;
    });

    const handleAnimationComplete = useCallback(() => {
      if (data.isDeleting && onNodeDelete) {
        onNodeDelete();
      }
    }, [data.isDeleting, onNodeDelete]);

    const baseStyles = cn(isDragTarget && 'drag-target', DRAGHANDLE.CLASS);

    const cardStyles = cn(
      'base-node-card',
      isLayouting && 'layouting',
      isDragTarget && 'drag-target',
      className
    );

    const rootStyles = cn(
      'root-node-card',
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
        ...(variant === 'replacing'
          ? { height: height ? `${height}px` : undefined }
          : { minHeight: height ? `${height}px` : undefined }),
        ...props.style,
      }),
      [width, height, props.style, variant]
    );

    // Determine which styles to use based on variant
    const variantStyles = useMemo(() => {
      switch (variant) {
        case 'root':
          return rootStyles;
        case 'card':
          return cardStyles;
        default:
          return baseStyles;
      }
    }, [variant, rootStyles, cardStyles, baseStyles]);

    return (
      <AnimatePresence>
        <motion.div
          key={id}
          style={nodeStyle}
          {...animationConfig}
          onAnimationComplete={handleAnimationComplete}
          className={cn(variantStyles, className)}
          {...props}
        >
          {children}
          <NodeHandlers layoutType={layoutType} id={id} side={data.side} />
          <NodeResizer isVisible={selected} minWidth={100} minHeight={60} />
          <Helper node={node} dragging={dragging} selected={selected} />
        </motion.div>
      </AnimatePresence>
    );
  },
  (prevProps, nextProps) => {
    const prevData = prevProps.node.data;
    const nextData = nextProps.node.data;

    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.node.selected === nextProps.node.selected &&
      prevProps.node.dragging === nextProps.node.dragging &&
      prevProps.node.width === nextProps.node.width &&
      prevProps.node.height === nextProps.node.height &&
      prevProps.className === nextProps.className &&
      prevProps.variant === nextProps.variant &&
      prevProps.children === nextProps.children &&
      prevData.isCollapsed === nextData.isCollapsed &&
      prevData.isDeleting === nextData.isDeleting &&
      prevData.side === nextData.side &&
      isEqual(prevData.collapsedChildren, nextData.collapsedChildren)
    );
  }
);

const Helper = memo(
  ({ node, dragging, selected }: { node: NodeProps<MindMapNode>; dragging: boolean; selected: boolean }) => {
    // Use getState() to avoid reactive subscription to selectedNodeIds
    // Only hide controls if: dragging OR (selected AND multiple nodes selected)
    const shouldHideControls = dragging || (selected && useCoreStore.getState().selectedNodeIds.size > 1);

    if (shouldHideControls) {
      return null;
    }

    return (
      <>
        <ChildNodeControls node={node} selected={selected} />
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if this node's selection, dragging, or data actually changed
    const prevData = prevProps.node.data;
    const nextData = nextProps.node.data;

    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.selected === nextProps.selected &&
      prevProps.dragging === nextProps.dragging &&
      prevProps.node.width === nextProps.node.width &&
      prevProps.node.height === nextProps.node.height &&
      isEqual(prevData.collapsedChildren, nextData.collapsedChildren)
    );
  }
);
