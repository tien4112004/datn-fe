import {
  useClipboardStore,
  useCoreStore,
  useLayoutStore,
  useNodeManipulationStore,
  useNodeOperationsStore,
} from '@/features/mindmap/stores';
import type { NodeManipulationState } from '@/features/mindmap/stores/nodeManipulation';
import type { CoreState } from '@/features/mindmap/stores/core';
import type { NodeOperationsState } from '@/features/mindmap/stores/nodeOperation';
import type { LayoutState } from '@/features/mindmap/stores/layout';
import type { ClipboardState } from '@/features/mindmap/stores/clipboard';
import { ArrowLeftFromLine, ArrowRightFromLine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MindMapNode, Direction, Side, MindMapTypes, LayoutType } from '@/features/mindmap/types';
import { Position, type NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import { DIRECTION, SIDE, MINDMAP_TYPES, LAYOUT_TYPE } from '@/features/mindmap/types';
import { cn } from '@/shared/lib/utils';
import { motion } from 'motion/react';
import { memo, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BaseHandle } from '../ui/base-handle';
import { isEqual } from 'lodash';

interface ChildNodeControlsProps {
  node: NodeProps<MindMapNode>;
  selected: boolean;
}

// Selectors for better memoization
const nodeManipulationSelector = (state: NodeManipulationState) => ({
  collapse: state.collapse,
  expand: state.expand,
});

const coreStoreSelector = (state: CoreState) => ({
  hasLeftChildren: state.hasLeftChildren,
  hasRightChildren: state.hasRightChildren,
});

const nodeOperationsSelector = (state: NodeOperationsState) => state.addChildNode;

const layoutStoreSelector = (state: LayoutState) => ({
  layout: state.layout,
  layoutType: state.layoutType,
});

const mouseOverSelector = (state: ClipboardState) => state.mouseOverNodeId;

export const ChildNodeControls = memo(
  ({ node, selected }: ChildNodeControlsProps) => {
    const canCreateLeft = node.data.side === SIDE.LEFT || node.data.side === SIDE.MID;
    const canCreateRight = node.data.side === SIDE.RIGHT || node.data.side === SIDE.MID;

    const { collapse, expand } = useNodeManipulationStore(useShallow(nodeManipulationSelector));
    const { hasLeftChildren, hasRightChildren } = useCoreStore(useShallow(coreStoreSelector));
    const addChildNodeStore = useNodeOperationsStore(nodeOperationsSelector);
    const { layout } = useLayoutStore(useShallow(layoutStoreSelector));

    const addChildNode = useCallback(
      (side: Side, type: MindMapTypes) => {
        expand(node.id, side);
        addChildNodeStore(node, { x: node.positionAbsoluteX, y: node.positionAbsoluteY + 200 }, side, type);
        // Auto-layout is now handled inside the addChildNode store function
      },
      [expand, addChildNodeStore, node.id, node.positionAbsoluteX, node.positionAbsoluteY]
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
            'absolute z-[10000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
            layout === DIRECTION.VERTICAL
              ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)] flex-col'
              : 'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2',
            (isMouseOver || selected) && canCreateLeft ? 'visible opacity-100' : 'invisible opacity-0'
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className={cn('cursor-pointer rounded-full transition-all duration-200')}
            onClick={() => {
              addChildNode(SIDE.LEFT, MINDMAP_TYPES.TEXT_NODE);
            }}
          >
            <Plus />
          </Button>
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
              >
                <Plus />
              </Button>
            </PopoverTrigger>
            <PopoverContent side={layout === DIRECTION.VERTICAL ? 'top' : 'left'} className="w-48 p-2">
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
          </Popover> */}
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
              variant="secondary"
              className={cn('cursor-pointer rounded-full transition-all duration-200')}
            >
              <motion.div
                animate={
                  layout === DIRECTION.HORIZONTAL
                    ? { rotate: isLeftChildrenCollapsed ? 0 : 180 }
                    : { rotate: isLeftChildrenCollapsed ? 90 : 270 }
                }
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                <ArrowLeftFromLine />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <div
          className={cn(
            'absolute z-[10000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
            layout === DIRECTION.VERTICAL
              ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)] flex-col'
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
              variant="secondary"
              className={cn('cursor-pointer rounded-full transition-all duration-200')}
            >
              <motion.div
                animate={
                  layout === DIRECTION.HORIZONTAL
                    ? { rotate: isRightChildrenCollapsed ? 0 : 180 }
                    : { rotate: isRightChildrenCollapsed ? 90 : 270 }
                }
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                <ArrowRightFromLine />
              </motion.div>
            </Button>
          </motion.div>
          <Button
            size="icon"
            variant="secondary"
            className={cn('cursor-pointer rounded-full transition-all duration-200')}
            onClick={() => {
              addChildNode(SIDE.RIGHT, MINDMAP_TYPES.TEXT_NODE);
            }}
          >
            <Plus />
          </Button>
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
              >
                <Plus />
              </Button>
            </PopoverTrigger>
            <PopoverContent side={layout === DIRECTION.VERTICAL ? 'bottom' : 'right'} className="w-48 p-2">
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
          </Popover> */}
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

export const NodeHandlers = memo(
  ({
    layout,
    layoutType,
    side,
    id,
  }: {
    layout: Direction;
    layoutType: LayoutType;
    side: Side;
    id: string;
  }) => {
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
      const timerId = setTimeout(() => {
        updateNodeInternals(id);
      }, 0);

      const timerId2 = setTimeout(() => {
        updateNodeInternals(id);
      }, 500);

      return () => {
        clearTimeout(timerId);
        clearTimeout(timerId2);
      };
    }, [layout, layoutType, id, updateNodeInternals]);

    /**
     * Determine which handles should be visible based on layout type and node side.
     * Returns visibility settings for each handle position.
     */
    const getHandleVisibility = () => {
      // For legacy layouts (horizontal/vertical balanced), use the old logic
      if (layoutType === LAYOUT_TYPE.HORIZONTAL_BALANCED || layoutType === LAYOUT_TYPE.NONE) {
        return {
          leftSource: side === SIDE.LEFT || side === SIDE.MID,
          rightSource: side === SIDE.RIGHT || side === SIDE.MID,
          topSource: false,
          bottomSource: false,
          leftTarget: true, // Always available but hidden
          rightTarget: true,
          topTarget: false,
          bottomTarget: false,
        };
      }

      if (layoutType === LAYOUT_TYPE.VERTICAL_BALANCED) {
        return {
          leftSource: false,
          rightSource: false,
          topSource: side === SIDE.LEFT || side === SIDE.MID, // "left" means "top" in vertical
          bottomSource: side === SIDE.RIGHT || side === SIDE.MID, // "right" means "bottom" in vertical
          leftTarget: false,
          rightTarget: false,
          topTarget: true,
          bottomTarget: true,
        };
      }

      if (layoutType === LAYOUT_TYPE.RIGHT_ONLY) {
        return {
          leftSource: false,
          rightSource: true, // All nodes can have children to the right
          topSource: false,
          bottomSource: false,
          leftTarget: true, // Children receive from left
          rightTarget: false,
          topTarget: false,
          bottomTarget: false,
        };
      }

      if (layoutType === LAYOUT_TYPE.ORG_CHART) {
        return {
          leftSource: false,
          rightSource: false,
          topSource: false,
          bottomSource: true, // Parents connect from bottom
          leftTarget: false,
          rightTarget: false,
          topTarget: true, // Children receive from top
          bottomTarget: false,
        };
      }

      if (layoutType === LAYOUT_TYPE.RADIAL) {
        // Radial layout needs all handles available
        return {
          leftSource: true,
          rightSource: true,
          topSource: true,
          bottomSource: true,
          leftTarget: true,
          rightTarget: true,
          topTarget: true,
          bottomTarget: true,
        };
      }

      // Default fallback
      return {
        leftSource: true,
        rightSource: true,
        topSource: false,
        bottomSource: false,
        leftTarget: true,
        rightTarget: true,
        topTarget: false,
        bottomTarget: false,
      };
    };

    const visibility = getHandleVisibility();

    return (
      <>
        {/* Left handles */}
        <BaseHandle
          type="source"
          position={Position.Left}
          style={visibility.leftSource ? {} : { visibility: 'hidden' }}
          id={`left-source-${id}`}
        />
        <BaseHandle
          type="target"
          position={Position.Left}
          style={{ visibility: 'hidden' }}
          id={`left-target-${id}`}
        />

        {/* Right handles */}
        <BaseHandle
          type="source"
          position={Position.Right}
          style={visibility.rightSource ? {} : { visibility: 'hidden' }}
          id={`right-source-${id}`}
        />
        <BaseHandle
          type="target"
          position={Position.Right}
          style={{ visibility: 'hidden' }}
          id={`right-target-${id}`}
        />

        {/* Top handles */}
        <BaseHandle
          type="source"
          position={Position.Top}
          style={visibility.topSource ? {} : { visibility: 'hidden' }}
          id={`top-source-${id}`}
        />
        <BaseHandle
          type="target"
          position={Position.Top}
          style={{ visibility: 'hidden' }}
          id={`top-target-${id}`}
        />

        {/* Bottom handles */}
        <BaseHandle
          type="source"
          position={Position.Bottom}
          style={visibility.bottomSource ? {} : { visibility: 'hidden' }}
          id={`bottom-source-${id}`}
        />
        <BaseHandle
          type="target"
          position={Position.Bottom}
          style={{ visibility: 'hidden' }}
          id={`bottom-target-${id}`}
        />

        {/* Legacy handles for backward compatibility */}
        <BaseHandle
          type="source"
          position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
          style={side === SIDE.LEFT || side === SIDE.MID ? {} : { visibility: 'hidden' }}
          id={`first-source-${id}`}
        />
        <BaseHandle
          type="source"
          position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
          style={side === SIDE.RIGHT || side === SIDE.MID ? {} : { visibility: 'hidden' }}
          id={`second-source-${id}`}
        />
        <BaseHandle
          type="target"
          position={layout === DIRECTION.VERTICAL ? Position.Top : Position.Left}
          style={{ visibility: 'hidden' }}
          id={`first-target-${id}`}
        />
        <BaseHandle
          type="target"
          position={layout === DIRECTION.VERTICAL ? Position.Bottom : Position.Right}
          style={{ visibility: 'hidden' }}
          id={`second-target-${id}`}
        />
      </>
    );
  }
);
