import { type ReactNode, type HTMLAttributes, useCallback, memo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode } from '@/features/mindmap/types';
import { NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { DIRECTION, type Direction, SIDE } from '@/features/mindmap/types/constants';
import { BaseHandle } from '../ui/base-handle';
import { ArrowLeftFromLine, ArrowRightFromLine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmapNodeCommon } from '@/features/mindmap/hooks';
import { useClipboardStore, useMindmapStore } from '@/features/mindmap/stores';

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

    const { layout, isLayouting, addChildNode, onNodeDelete } = useMindmapNodeCommon<MindMapNode>({
      node,
    });

    const handleAnimationComplete = useCallback(() => {
      if (data.isDeleting && onNodeDelete) {
        onNodeDelete();
      }
    }, [data.isDeleting, onNodeDelete]);

    const onMouseEnter = useCallback(() => {
      setIsMouseOver(true);
    }, [setIsMouseOver]);

    const onMouseLeave = useCallback(() => {
      setIsMouseOver(false);
    }, [setIsMouseOver]);

    const baseStyles = cn(isDragTarget && 'ring-2 ring-green-400 bg-green-50');

    const cardStyles = cn(
      'bg-card text-card-foreground relative',
      'hover:ring-1',
      '[.react-flow\\_\\_node.selected_&]:border-muted-foreground',
      '[.react-flow\\_\\_node.selected_&]:shadow-lg',
      isLayouting && 'shadow-lg ring-2 ring-blue-300',
      isDragTarget && 'ring-2 ring-green-400 bg-green-50',
      'rounded-md border rounded-lg border-2 shadow-md'
    );

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
              <NodeResizer color="#ff0071" isVisible={isSelected} minWidth={100} minHeight={30} />
              <NodeHandlers layout={layout} id={id} />
              <CreateChildNodeButtons
                node={node}
                addChildNode={addChildNode}
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
              <NodeResizer color="#ff0071" isVisible={isSelected} minWidth={100} minHeight={30} />
              <NodeHandlers layout={layout} id={id} />
              <CreateChildNodeButtons
                node={node}
                addChildNode={addChildNode}
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

export const NodeHandlers = memo(({ layout, id }: { layout: Direction; id: string }) => {
  const [currentLayout, setCurrentLayout] = useState(layout);

  if (currentLayout !== layout && layout !== DIRECTION.NONE) {
    setCurrentLayout(layout);
  }

  return (
    <>
      <BaseHandle
        type="source"
        position={currentLayout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={{ visibility: 'hidden' }}
        id={`first-source-${id}`}
      />
      <BaseHandle
        type="source"
        position={currentLayout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={{ visibility: 'hidden' }}
        id={`second-source-${id}`}
      />
      <BaseHandle
        type="target"
        position={currentLayout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={{ visibility: 'hidden' }}
        id={`first-target-${id}`}
      />
      <BaseHandle
        type="target"
        position={currentLayout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={{ visibility: 'hidden' }}
        id={`second-target-${id}`}
      />
    </>
  );
});

interface CreateChildNodeButtonsProps {
  node: NodeProps<MindMapNode>;
  addChildNode: any;
  isMouseOver: boolean;
  isSelected: boolean;
  layout: Direction;
}

export const CreateChildNodeButtons = memo(
  ({ node, addChildNode, isMouseOver, isSelected, layout }: CreateChildNodeButtonsProps) => {
    const canCreateLeft = node.data.side === SIDE.LEFT || node.data.side === SIDE.MID;
    const canCreateRight = node.data.side === SIDE.RIGHT || node.data.side === SIDE.MID;

    const toggleCollapse = useMindmapStore((state) => state.toggleCollapse);
    const hasLeftChildren = useMindmapStore((state) => state.hasLeftChildren);
    const hasRightChildren = useMindmapStore((state) => state.hasRightChildren);

    return (
      <>
        {/* Add Child Buttons */}
        <div
          className={cn(
            'absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
            layout === DIRECTION.VERTICAL
              ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)]'
              : 'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2',
            (isMouseOver || isSelected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0'
          )}
        >
          <Button
            onClick={() => {
              toggleCollapse(node.id, SIDE.LEFT, false);
              setTimeout(() => {
                addChildNode(node, { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY }, SIDE.LEFT);
              }, 300);
            }}
            size="icon"
            variant="outline"
            className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
          >
            <Plus />
          </Button>
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn(hasLeftChildren(node.id) ? 'visible opacity-100' : 'invisible opacity-0')}
          >
            <Button
              onClick={() => {
                toggleCollapse(node.id, SIDE.LEFT, !node.data.isLeftChildrenCollapsed);
              }}
              size="icon"
              variant="outline"
              className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
            >
              <motion.div
                animate={{ rotate: node.data.isLeftChildrenCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <ArrowLeftFromLine />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <div
          className={cn(
            'absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
            layout === DIRECTION.VERTICAL
              ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]'
              : 'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]',
            (isMouseOver || isSelected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0'
          )}
        >
          <Button
            onClick={() => {
              toggleCollapse(node.id, SIDE.RIGHT, false);
              setTimeout(() => {
                addChildNode(
                  node,
                  { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
                  SIDE.RIGHT
                );
              }, 300);
            }}
            size="icon"
            variant="outline"
            className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
          >
            <Plus />
          </Button>

          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn(hasRightChildren(node.id) ? 'visible opacity-100' : 'invisible opacity-0')}
          >
            <Button
              onClick={() => {
                toggleCollapse(node.id, SIDE.RIGHT, !node.data.isRightChildrenCollapsed);
              }}
              size="icon"
              variant="outline"
              className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
            >
              <motion.div
                animate={{ rotate: node.data.isRightChildrenCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <ArrowRightFromLine />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific properties change
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.layout === nextProps.layout &&
      prevProps.node.data === nextProps.node.data &&
      (prevProps.isMouseOver || prevProps.isSelected) === (nextProps.isMouseOver || nextProps.isSelected)
    );
  }
);

BaseNodeBlock.displayName = 'MindmapNodeBase';
