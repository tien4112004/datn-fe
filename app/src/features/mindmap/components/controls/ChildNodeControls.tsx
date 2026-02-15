import { Button } from '@/components/ui/button';
import {
  useClipboardStore,
  useCoreStore,
  useLayoutStore,
  useNodeManipulationStore,
  useNodeOperationsStore,
} from '@/features/mindmap/stores';
import type { ClipboardState } from '@/features/mindmap/stores/clipboard';
import type { CoreState } from '@/features/mindmap/stores/core';
import type { LayoutState } from '@/features/mindmap/stores/layout';
import type { NodeManipulationState } from '@/features/mindmap/stores/nodeManipulation';
import type { NodeOperationsState } from '@/features/mindmap/stores/nodeOperation';
import type { LayoutType, MindMapNode, MindMapTypes, Side } from '@/features/mindmap/types';
import { LAYOUT_TYPE, MINDMAP_TYPES, SIDE } from '@/features/mindmap/types';
import { DEFAULT_LAYOUT_TYPE } from '../../services/utils';
import { cn } from '@/shared/lib/utils';
import { Position, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMindmapPermissionContext } from '../../contexts/MindmapPermissionContext';
import { BaseHandle } from '../ui/base-handle';

interface ChildNodeControlsProps {
  node: NodeProps<MindMapNode>;
  selected: boolean;
}

// Selectors for better memoization
const nodeManipulationSelector = (state: NodeManipulationState) => ({
  collapse: state.collapse,
  expand: state.expand,
});

const nodeOperationsSelector = (state: NodeOperationsState) => state.addChildNode;

const layoutStoreSelector = (state: LayoutState) => ({
  isLayouting: state.isLayouting,
});

export const ChildNodeControls = memo(
  ({ node, selected }: ChildNodeControlsProps) => {
    const { canEdit } = useMindmapPermissionContext();
    const { collapse, expand } = useNodeManipulationStore(useShallow(nodeManipulationSelector));
    const hasLeftChildren = useCoreStore((state) => state.hasLeftChildren);
    const hasRightChildren = useCoreStore((state) => state.hasRightChildren);
    const addChildNodeStore = useNodeOperationsStore(nodeOperationsSelector);
    useLayoutStore(useShallow(layoutStoreSelector));

    // Get layoutType using cached maps - O(1) lookup
    const layoutType = useCoreStore((state) => {
      const rootId = state.nodeToRootMap.get(node.id);
      return (rootId && state.rootLayoutTypeMap.get(rootId)) || DEFAULT_LAYOUT_TYPE;
    });

    const isRootNode = node.type === MINDMAP_TYPES.ROOT_NODE;

    // Memoize the canCreateSides calculation to avoid recalculating on every render
    const { canCreateLeft, canCreateRight, canCreateTop, canCreateBottom } = useMemo(() => {
      const side = node.data.side;
      const isMid = side === SIDE.MID;

      switch (layoutType) {
        case LAYOUT_TYPE.HORIZONTAL_BALANCED:
          return {
            canCreateLeft: side === SIDE.LEFT || isMid || isRootNode,
            canCreateRight: side === SIDE.RIGHT || isMid || isRootNode,
            canCreateTop: false,
            canCreateBottom: false,
          };

        case LAYOUT_TYPE.VERTICAL_BALANCED:
          return {
            canCreateLeft: false,
            canCreateRight: false,
            canCreateTop: side === SIDE.TOP || isMid || isRootNode,
            canCreateBottom: side === SIDE.BOTTOM || isMid || isRootNode,
          };

        case LAYOUT_TYPE.RIGHT_ONLY:
          return {
            canCreateLeft: false,
            canCreateRight: true,
            canCreateTop: false,
            canCreateBottom: false,
          };

        case LAYOUT_TYPE.LEFT_ONLY:
          return {
            canCreateLeft: true,
            canCreateRight: false,
            canCreateTop: false,
            canCreateBottom: false,
          };

        case LAYOUT_TYPE.BOTTOM_ONLY:
          return {
            canCreateLeft: false,
            canCreateRight: false,
            canCreateTop: false,
            canCreateBottom: true,
          };

        case LAYOUT_TYPE.TOP_ONLY:
          return {
            canCreateLeft: false,
            canCreateRight: false,
            canCreateTop: true,
            canCreateBottom: false,
          };

        default:
          return {
            canCreateLeft: side === SIDE.LEFT || isMid || isRootNode,
            canCreateRight: side === SIDE.RIGHT || isMid || isRootNode,
            canCreateTop: false,
            canCreateBottom: false,
          };
      }
    }, [layoutType, node.data.side, node.type]);

    const addChildNode = useCallback(
      (side: Side, type: MindMapTypes) => {
        expand(node.id, side);
        addChildNodeStore(node, { x: node.positionAbsoluteX, y: node.positionAbsoluteY + 200 }, side, type);
        // Auto-layout is now handled inside the addChildNode store function
      },
      [expand, addChildNodeStore, node.id, node.positionAbsoluteX, node.positionAbsoluteY]
    );

    // Optimize selector to return boolean, preventing re-renders when mouseOverNodeId changes
    // but matches neither the previous nor current node id for this component
    const isMouseOver = useClipboardStore((state) => state.mouseOverNodeId === node.id);

    const isLeftChildrenCollapsed = (node.data.collapsedChildren?.leftNodes || []).length > 0;
    const isRightChildrenCollapsed = (node.data.collapsedChildren?.rightNodes || []).length > 0;

    // Determine if we're in a vertical-flow layout (TOP_ONLY, BOTTOM_ONLY, VERTICAL_BALANCED)
    const isVerticalFlow =
      layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
      layoutType === LAYOUT_TYPE.TOP_ONLY ||
      layoutType === LAYOUT_TYPE.BOTTOM_ONLY;

    // Determine if we're in a horizontal-flow layout (LEFT_ONLY, RIGHT_ONLY, HORIZONTAL_BALANCED)
    const isHorizontalFlow =
      layoutType === LAYOUT_TYPE.HORIZONTAL_BALANCED ||
      layoutType === LAYOUT_TYPE.LEFT_ONLY ||
      layoutType === LAYOUT_TYPE.RIGHT_ONLY;

    return (
      <>
        {/* Left side button (for horizontal layouts) */}
        {isHorizontalFlow && (
          <div
            className={cn(
              'absolute z-[10000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
              'left-0 top-1/2 -translate-x-[calc(100%+24px)] -translate-y-1/2',
              (isMouseOver || selected || isLeftChildrenCollapsed) &&
                (canCreateLeft || hasLeftChildren(node.id) || isLeftChildrenCollapsed)
                ? 'visible opacity-100'
                : 'invisible opacity-0'
            )}
          >
            {canEdit && (
              <Button
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
                onClick={() => {
                  addChildNode(SIDE.LEFT, MINDMAP_TYPES.TEXT_NODE);
                }}
              >
                <Plus />
              </Button>
            )}
            {/* Collapse/expand button - visible in View Mode */}
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
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
              >
                <Minus />
              </Button>
            </motion.div>
          </div>
        )}

        {/* Right side button (for horizontal layouts) */}
        {isHorizontalFlow && (
          <div
            className={cn(
              'absolute z-[10000] flex items-center justify-center gap-1 rounded-sm transition-all duration-200',
              'right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+24px)]',
              (isMouseOver || selected || isRightChildrenCollapsed) &&
                (canCreateRight || hasRightChildren(node.id) || isRightChildrenCollapsed)
                ? 'visible opacity-100'
                : 'invisible opacity-0'
            )}
          >
            {/* Collapse/expand button - visible in View Mode */}
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
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
              >
                <Minus />
              </Button>
            </motion.div>
            {canEdit && (
              <Button
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
                onClick={() => {
                  addChildNode(SIDE.RIGHT, MINDMAP_TYPES.TEXT_NODE);
                }}
              >
                <Plus />
              </Button>
            )}
          </div>
        )}

        {/* Top side button (for vertical layouts) */}
        {isVerticalFlow && (
          <div
            className={cn(
              'absolute z-[10000] flex flex-col items-center justify-center gap-1 rounded-sm transition-all duration-200',
              'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+24px)]',
              (isMouseOver || selected || isLeftChildrenCollapsed) &&
                (canCreateTop || hasLeftChildren(node.id) || isLeftChildrenCollapsed)
                ? 'visible opacity-100'
                : 'invisible opacity-0'
            )}
          >
            {canEdit && (
              <Button
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
                onClick={() => {
                  addChildNode(SIDE.TOP, MINDMAP_TYPES.TEXT_NODE);
                }}
              >
                <Plus />
              </Button>
            )}
            {/* Collapse/expand button - visible in View Mode */}
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
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
              >
                <Minus />
              </Button>
            </motion.div>
          </div>
        )}

        {/* Bottom side button (for vertical layouts) */}
        {isVerticalFlow && (
          <div
            className={cn(
              'absolute z-[10000] flex flex-col items-center justify-center gap-1 rounded-sm transition-all duration-200',
              'bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+24px)]',
              (isMouseOver || selected || isRightChildrenCollapsed) &&
                (canCreateBottom || hasRightChildren(node.id) || isRightChildrenCollapsed)
                ? 'visible opacity-100'
                : 'invisible opacity-0'
            )}
          >
            {/* Collapse/expand button - visible in View Mode */}
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
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
              >
                <Minus />
              </Button>
            </motion.div>
            {canEdit && (
              <Button
                variant="secondary"
                className={cn('cursor-pointer rounded-full transition-all duration-200')}
                onClick={() => {
                  addChildNode(SIDE.BOTTOM, MINDMAP_TYPES.TEXT_NODE);
                }}
              >
                <Plus />
              </Button>
            )}
          </div>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if node ID, selection state, side, or type changed
    return (
      prevProps.node.id === nextProps.node.id &&
      prevProps.selected === nextProps.selected &&
      prevProps.node.data.side === nextProps.node.data.side &&
      prevProps.node.type === nextProps.node.type &&
      prevProps.node.data.collapsedChildren === nextProps.node.data.collapsedChildren
    );
  }
);

export const NodeHandlers = memo(
  ({ layoutType, side, id }: { layoutType: LayoutType; side: Side; id: string }) => {
    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
      updateNodeInternals(id);

      const timerId2 = setTimeout(() => {
        updateNodeInternals(id);
      }, 1000);

      const timerId3 = setTimeout(() => {
        updateNodeInternals(id);
      }, 2000);

      return () => {
        clearTimeout(timerId2);
        clearTimeout(timerId3);
      };
    }, [layoutType, id, side, updateNodeInternals]);

    /**
     * Determine which handles should be visible based on layout type and node side.
     * The new system uses the node's side directly to determine handle visibility.
     * Each layout type specifies which sides are valid, and handles are shown accordingly.
     */
    const getHandleVisibility = () => {
      const isMid = side === SIDE.MID;

      // For each layout type, determine valid source handles based on the node's side
      switch (layoutType) {
        case LAYOUT_TYPE.HORIZONTAL_BALANCED:
          return {
            // Source handles: node can have children on its side or both if MID
            leftSource: side === SIDE.LEFT || isMid,
            rightSource: side === SIDE.RIGHT || isMid,
            topSource: false,
            bottomSource: false,
            // Target handles: always available for incoming edges
            leftTarget: true,
            rightTarget: true,
            topTarget: false,
            bottomTarget: false,
          };

        case LAYOUT_TYPE.VERTICAL_BALANCED:
          return {
            leftSource: false,
            rightSource: false,
            // Source handles: node can have children on its side (TOP/BOTTOM)
            topSource: side === SIDE.TOP || isMid,
            bottomSource: side === SIDE.BOTTOM || isMid,
            leftTarget: false,
            rightTarget: false,
            topTarget: true,
            bottomTarget: true,
          };

        case LAYOUT_TYPE.RIGHT_ONLY:
          return {
            leftSource: false,
            rightSource: true, // All nodes can have children to the right
            topSource: false,
            bottomSource: false,
            leftTarget: true, // All non-root nodes receive edges from left
            rightTarget: false,
            topTarget: false,
            bottomTarget: false,
          };

        case LAYOUT_TYPE.LEFT_ONLY:
          return {
            leftSource: true, // All nodes can have children to the left
            rightSource: false,
            topSource: false,
            bottomSource: false,
            leftTarget: false,
            rightTarget: true, // All non-root nodes receive edges from right
            topTarget: false,
            bottomTarget: false,
          };

        case LAYOUT_TYPE.BOTTOM_ONLY:
          return {
            leftSource: false,
            rightSource: false,
            topSource: false,
            bottomSource: true, // All nodes can have children below
            leftTarget: false,
            rightTarget: false,
            topTarget: true, // All non-root nodes receive edges from top
            bottomTarget: false,
          };

        case LAYOUT_TYPE.TOP_ONLY:
          return {
            leftSource: false,
            rightSource: false,
            topSource: true, // All nodes can have children above
            bottomSource: false,
            leftTarget: false,
            rightTarget: false,
            topTarget: false,
            bottomTarget: true, // All non-root nodes receive edges from bottom
          };

        default:
          // Default: horizontal-like behavior
          return {
            leftSource: side === SIDE.LEFT || isMid,
            rightSource: side === SIDE.RIGHT || isMid,
            topSource: false,
            bottomSource: false,
            leftTarget: true,
            rightTarget: true,
            topTarget: false,
            bottomTarget: false,
          };
      }
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
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if layout type, side, or id changed
    return (
      prevProps.layoutType === nextProps.layoutType &&
      prevProps.side === nextProps.side &&
      prevProps.id === nextProps.id
    );
  }
);

NodeHandlers.displayName = 'NodeHandlers';
