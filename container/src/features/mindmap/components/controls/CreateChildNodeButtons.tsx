import { useMindmapStore } from '@/features/mindmap/stores';
import { ArrowLeftFromLine, ArrowRightFromLine, Plus, Type, Square, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import type { MindMapNode, Direction, Side, MindMapTypes } from '@/features/mindmap/types';
import { Position, type NodeProps } from '@xyflow/react';
import { DIRECTION, SIDE, MINDMAP_TYPES } from '@/features/mindmap/types';
import { cn } from '@/shared/lib/utils';
import { motion } from 'motion/react';
import { memo, useCallback, useState } from 'react';
import { BaseHandle } from '../ui/base-handle';

interface CreateChildNodeButtonsProps {
  node: NodeProps<MindMapNode>;
  isMouseOver: boolean;
  isSelected: boolean;
  layout: Direction;
}

export const CreateChildNodeButtons = memo(
  ({ node, isMouseOver, isSelected, layout }: CreateChildNodeButtonsProps) => {
    const canCreateLeft = node.data.side === SIDE.LEFT || node.data.side === SIDE.MID;
    const canCreateRight = node.data.side === SIDE.RIGHT || node.data.side === SIDE.MID;

    const toggleCollapse = useMindmapStore((state) => state.toggleCollapse);
    const hasLeftChildren = useMindmapStore((state) => state.hasLeftChildren);
    const hasRightChildren = useMindmapStore((state) => state.hasRightChildren);
    const addChildNodeStore = useMindmapStore((state) => state.addChildNode);
    const layoutSubtree = useMindmapStore((state) => state.updateSubtreeLayout);

    const addChildNode = useCallback((side: Side, type: MindMapTypes) => {
      toggleCollapse(node.id, side, false);
      setTimeout(() => {
        addChildNodeStore(node, { x: node.positionAbsoluteX, y: node.positionAbsoluteY }, side, type);

        layoutSubtree(node.id, layout);
      }, 300);
    }, []);

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
                    addChildNode(SIDE.LEFT, MINDMAP_TYPES.TEXT_NODE);
                  }}
                >
                  <Type className="h-4 w-4" />
                  Text Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    addChildNode(SIDE.LEFT, MINDMAP_TYPES.SHAPE_NODE);
                  }}
                >
                  <Square className="h-4 w-4" />
                  Shape Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    addChildNode(SIDE.LEFT, MINDMAP_TYPES.IMAGE_NODE);
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
                animate={
                  layout === DIRECTION.HORIZONTAL
                    ? { rotate: node.data.isLeftChildrenCollapsed ? 0 : 180 }
                    : { rotate: node.data.isLeftChildrenCollapsed ? 90 : 270 }
                }
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
                animate={
                  layout === DIRECTION.HORIZONTAL
                    ? { rotate: node.data.isRightChildrenCollapsed ? 0 : 180 }
                    : { rotate: node.data.isRightChildrenCollapsed ? 90 : 270 }
                }
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
                    addChildNode(SIDE.RIGHT, MINDMAP_TYPES.TEXT_NODE);
                  }}
                >
                  <Type className="h-4 w-4" />
                  Text Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    addChildNode(SIDE.RIGHT, MINDMAP_TYPES.SHAPE_NODE);
                  }}
                >
                  <Square className="h-4 w-4" />
                  Shape Node
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    addChildNode(SIDE.RIGHT, MINDMAP_TYPES.IMAGE_NODE);
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

export const NodeHandlers = memo(({ layout, side, id }: { layout: Direction; side: Side; id: string }) => {
  const [currentLayout, setCurrentLayout] = useState(layout);

  if (currentLayout !== layout && layout !== DIRECTION.NONE) {
    setCurrentLayout(layout);
  }

  return (
    <>
      <BaseHandle
        type="source"
        position={currentLayout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
        style={side === SIDE.LEFT || side === SIDE.MID ? {} : { visibility: 'hidden' }}
        id={`first-source-${id}`}
      />
      <BaseHandle
        type="source"
        position={currentLayout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
        style={side === SIDE.RIGHT || side === SIDE.MID ? {} : { visibility: 'hidden' }}
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
