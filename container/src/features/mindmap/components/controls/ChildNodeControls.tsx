import {
  useClipboardStore,
  useCoreStore,
  useLayoutStore,
  useNodeManipulationStore,
  useNodeOperationsStore,
} from '@/features/mindmap/stores';
import { ArrowLeftFromLine, ArrowRightFromLine, Plus, Type, Square, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import type { MindMapNode, Direction, Side, MindMapTypes } from '@/features/mindmap/types';
import { Position, type NodeProps } from '@xyflow/react';
import { DIRECTION, SIDE, MINDMAP_TYPES } from '@/features/mindmap/types';
import { cn } from '@/shared/lib/utils';
import { motion } from 'motion/react';
import { memo, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BaseHandle } from '../ui/base-handle';
import { isEqual } from 'lodash';

interface ChildNodeControlsProps {
  node: NodeProps<MindMapNode>;
  selected: boolean;
}

// Selectors for better memoization
const nodeManipulationSelector = (state: any) => ({
  collapse: state.collapse,
  expand: state.expand,
});

const coreStoreSelector = (state: any) => ({
  hasLeftChildren: state.hasLeftChildren,
  hasRightChildren: state.hasRightChildren,
});

const nodeOperationsSelector = (state: any) => state.addChildNode;

const layoutStoreSelector = (state: any) => ({
  updateSubtreeLayout: state.updateSubtreeLayout,
  layout: state.layout,
});

const mouseOverSelector = (state: any) => state.mouseOverNodeId;

export const ChildNodeControls = memo(
  ({ node, selected }: ChildNodeControlsProps) => {
    const canCreateLeft = node.data.side === SIDE.LEFT || node.data.side === SIDE.MID;
    const canCreateRight = node.data.side === SIDE.RIGHT || node.data.side === SIDE.MID;

    const { collapse, expand } = useNodeManipulationStore(useShallow(nodeManipulationSelector));
    const { hasLeftChildren, hasRightChildren } = useCoreStore(useShallow(coreStoreSelector));
    const addChildNodeStore = useNodeOperationsStore(nodeOperationsSelector);
    const { updateSubtreeLayout, layout } = useLayoutStore(useShallow(layoutStoreSelector));

    const addChildNode = useCallback(
      (side: Side, type: MindMapTypes) => {
        expand(node.id, side);
        addChildNodeStore(node, { x: node.positionAbsoluteX, y: node.positionAbsoluteY }, side, type);
        setTimeout(() => {
          updateSubtreeLayout(node.id, layout);
        }, 200);
      },
      [
        expand,
        addChildNodeStore,
        updateSubtreeLayout,
        layout,
        node.id,
        node.positionAbsoluteX,
        node.positionAbsoluteY,
      ]
    );

    const mouseOverNodeId = useClipboardStore(useShallow(mouseOverSelector));
    const isMouseOver = mouseOverNodeId === node.id;

    const isLeftChildrenCollapsed = (node.data.collapsedChildren?.leftNodes || []).length > 0;
    const isRightChildrenCollapsed = (node.data.collapsedChildren?.rightNodes || []).length > 0;

    return (
      <>
        {/* Add Child Buttons */}
        <div
          className={cn(
            'absolute z-[1000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
            layout === DIRECTION.VERTICAL
              ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)]'
              : 'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2',
            (isMouseOver || selected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0'
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
            className={cn(
              hasLeftChildren(node.id) || isLeftChildrenCollapsed
                ? 'visible opacity-100'
                : 'invisible opacity-0'
            )}
          >
            <Button
              onClick={() => {
                if (isLeftChildrenCollapsed) expand(node.id, SIDE.LEFT);
                else collapse(node.id, SIDE.LEFT);
              }}
              size="icon"
              variant="outline"
              className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
            >
              <motion.div
                animate={
                  layout === DIRECTION.HORIZONTAL
                    ? { rotate: isLeftChildrenCollapsed ? 0 : 180 }
                    : { rotate: isLeftChildrenCollapsed ? 90 : 270 }
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
            (isMouseOver || selected) && canCreateRight ? 'visible opacity-100' : 'invisible opacity-0'
          )}
        >
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn(
              hasRightChildren(node.id) || isRightChildrenCollapsed
                ? 'visible opacity-100'
                : 'invisible opacity-0'
            )}
          >
            <Button
              onClick={() => {
                if (isRightChildrenCollapsed) expand(node.id, SIDE.RIGHT);
                else collapse(node.id, SIDE.RIGHT);
              }}
              size="icon"
              variant="outline"
              className={cn('bg-accent cursor-pointer rounded-full transition-all duration-200')}
            >
              <motion.div
                animate={
                  layout === DIRECTION.HORIZONTAL
                    ? { rotate: isRightChildrenCollapsed ? 0 : 180 }
                    : { rotate: isRightChildrenCollapsed ? 90 : 270 }
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
    const prevData = prevProps.node.data;
    const nextData = nextProps.node.data;

    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.selected === nextProps.selected &&
      prevData.side === nextData.side &&
      isEqual(prevData.collapsedChildren?.leftNodes, nextData.collapsedChildren?.leftNodes) &&
      isEqual(prevData.collapsedChildren?.rightNodes, nextData.collapsedChildren?.rightNodes)
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
