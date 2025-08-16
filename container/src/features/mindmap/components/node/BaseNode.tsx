import { type ReactNode, type HTMLAttributes, useCallback, memo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BaseNode } from '@/features/mindmap/components/ui/base-node';
import { cn } from '@/shared/lib/utils';
import type { MindMapNode, Direction } from '@/features/mindmap/types';
import { NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { DIRECTION, SIDE, MINDMAP_TYPES } from '@/features/mindmap/types';
import { BaseHandle } from '../ui/base-handle';
import { ArrowLeftFromLine, ArrowRightFromLine, Plus, Type, Square, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { useMindmapNodeCommon } from '@/features/mindmap/hooks';
import { useClipboardStore, useCoreStore, useNodeManipulationStore } from '@/features/mindmap/stores';

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

    const toggleCollapse = useNodeManipulationStore((state) => state.toggleCollapse);
    const hasLeftChildren = useCoreStore((state) => state.hasLeftChildren);
    const hasRightChildren = useCoreStore((state) => state.hasRightChildren);

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
              >
                <Plus />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-48 p-2">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toggleCollapse(node.id, SIDE.LEFT, false);
                    setTimeout(() => {
                      addChildNode(
                        node,
                        { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
                        SIDE.LEFT,
                        MINDMAP_TYPES.TEXT_NODE
                      );
                    }, 300);
                  }}
                >
                  <Type className="h-4 w-4" />
                  Text Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toggleCollapse(node.id, SIDE.LEFT, false);
                    setTimeout(() => {
                      addChildNode(
                        node,
                        { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
                        SIDE.LEFT,
                        MINDMAP_TYPES.SHAPE_NODE
                      );
                    }, 300);
                  }}
                >
                  <Square className="h-4 w-4" />
                  Shape Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toggleCollapse(node.id, SIDE.LEFT, false);
                    setTimeout(() => {
                      addChildNode(
                        node,
                        { x: node.positionAbsoluteX - 250, y: node.positionAbsoluteY },
                        SIDE.LEFT,
                        MINDMAP_TYPES.IMAGE_NODE
                      );
                    }, 300);
                  }}
                >
                  <Image className="h-4 w-4" />
                  Image Node
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
              >
                <Plus />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="right" className="w-48 p-2">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toggleCollapse(node.id, SIDE.RIGHT, false);
                    setTimeout(() => {
                      addChildNode(
                        node,
                        { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
                        SIDE.RIGHT,
                        MINDMAP_TYPES.TEXT_NODE
                      );
                    }, 300);
                  }}
                >
                  <Type className="h-4 w-4" />
                  Text Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toggleCollapse(node.id, SIDE.RIGHT, false);
                    setTimeout(() => {
                      addChildNode(
                        node,
                        { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
                        SIDE.RIGHT,
                        MINDMAP_TYPES.SHAPE_NODE
                      );
                    }, 300);
                  }}
                >
                  <Square className="h-4 w-4" />
                  Shape Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toggleCollapse(node.id, SIDE.RIGHT, false);
                    setTimeout(() => {
                      addChildNode(
                        node,
                        { x: node.positionAbsoluteX + 250, y: node.positionAbsoluteY },
                        SIDE.RIGHT,
                        MINDMAP_TYPES.IMAGE_NODE
                      );
                    }, 300);
                  }}
                >
                  <Image className="h-4 w-4" />
                  Image Node
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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

BaseNodeControl.displayName = 'BaseNodeControl';
BaseNodeBlock.displayName = 'MindmapNodeBase';
