import { create } from 'zustand';
import type { XYPosition } from '@xyflow/react';
import { devtools } from 'zustand/middleware';
import type { MindMapNode, MindMapEdge, MindMapTypes, PathType, Side, LayoutType } from '../types';
import { MINDMAP_TYPES, PATH_TYPES, DRAGHANDLE, SIDE, LAYOUT_TYPE } from '../types';
import { generateId } from '@/shared/lib/utils';
import {
  getRootNodeOfSubtree,
  getAllDescendantNodes,
  getTreeLayoutType,
  getTreeForceLayout,
  getOppositeSide,
} from '../services/utils';
import { useCoreStore } from './core';
import { useUndoRedoStore } from './undoredo';
import { useLayoutStore } from './layout';

interface NewNodeData {
  content: string;
  position: XYPosition;
}

// Default spacing constants
const DEFAULT_HORIZONTAL_SPACING = 200;
const DEFAULT_VERTICAL_SPACING = 80;
const DEFAULT_NODE_HEIGHT = 50;
const DEFAULT_NODE_WIDTH = 180;

/**
 * Calculates the position for a new child node after the last sibling.
 * - For horizontal layouts: Position is offset in x-direction from parent, y after last sibling
 * - For vertical layouts: Position is offset in y-direction from parent, x after last sibling
 *
 * Alignment rules:
 * - Right children: aligned by left edge (grow rightward)
 * - Left children: aligned by right edge (grow leftward)
 * - Bottom children: aligned by top edge (grow downward)
 * - Top children: aligned by bottom edge (grow upward)
 */
const calculatePositionAfterLastSibling = (
  parentNode: MindMapNode,
  siblings: MindMapNode[],
  side: Side | 'mid',
  layoutType: LayoutType,
  _fallbackPosition: XYPosition
): XYPosition => {
  const parentX = parentNode.position?.x ?? 0;
  const parentY = parentNode.position?.y ?? 0;

  // If no siblings, return a position relative to parent based on layout type
  if (siblings.length === 0) {
    return getInitialChildPosition(parentX, parentY, side, layoutType, parentNode);
  }

  // Determine if this is a vertical or horizontal flow layout
  const isVerticalFlow =
    layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
    layoutType === LAYOUT_TYPE.TOP_ONLY ||
    layoutType === LAYOUT_TYPE.BOTTOM_ONLY;

  if (isVerticalFlow) {
    // For vertical layouts, find the rightmost sibling and position after it
    const lastSibling = siblings.reduce((rightmost, sibling) => {
      const siblingRight = (sibling.position?.x ?? 0) + (sibling.measured?.width ?? DEFAULT_NODE_WIDTH);
      const rightmostRight = (rightmost.position?.x ?? 0) + (rightmost.measured?.width ?? DEFAULT_NODE_WIDTH);
      return siblingRight > rightmostRight ? sibling : rightmost;
    }, siblings[0]);

    const lastSiblingRight =
      (lastSibling.position?.x ?? 0) + (lastSibling.measured?.width ?? DEFAULT_NODE_WIDTH);

    // Calculate y offset based on side (TOP vs BOTTOM)
    let yOffset: number;
    if (side === SIDE.TOP) {
      yOffset = -DEFAULT_VERTICAL_SPACING - DEFAULT_NODE_HEIGHT;
    } else {
      yOffset = DEFAULT_VERTICAL_SPACING + (parentNode.measured?.height ?? DEFAULT_NODE_HEIGHT);
    }

    return {
      x: lastSiblingRight + DEFAULT_VERTICAL_SPACING,
      y: parentY + yOffset,
    };
  } else {
    // For horizontal layouts, find the bottommost sibling and position after it
    const lastSibling = siblings.reduce((bottommost, sibling) => {
      const siblingBottom = (sibling.position?.y ?? 0) + (sibling.measured?.height ?? DEFAULT_NODE_HEIGHT);
      const bottommostBottom =
        (bottommost.position?.y ?? 0) + (bottommost.measured?.height ?? DEFAULT_NODE_HEIGHT);
      return siblingBottom > bottommostBottom ? sibling : bottommost;
    }, siblings[0]);

    const lastSiblingBottom =
      (lastSibling.position?.y ?? 0) + (lastSibling.measured?.height ?? DEFAULT_NODE_HEIGHT);

    // Get reference X position from the first sibling for proper alignment
    // For left side: align right edges at (parentX - spacing)
    // For right side: align left edges at (parentX + parentWidth + spacing)
    let newNodeX: number;
    if (side === SIDE.LEFT) {
      // Left children: right edge should be at (parentX - spacing)
      // So x position = parentX - spacing - newNodeWidth
      // Since we don't know the new node's width yet, use DEFAULT_NODE_WIDTH
      newNodeX = parentX - DEFAULT_HORIZONTAL_SPACING - DEFAULT_NODE_WIDTH;
    } else {
      // Right children: align left edges - use the first sibling's x position
      const leftmostSibling = siblings.reduce((leftmost, sibling) => {
        const siblingX = sibling.position?.x ?? 0;
        const leftmostX = leftmost.position?.x ?? 0;
        return siblingX < leftmostX ? sibling : leftmost;
      }, siblings[0]);
      newNodeX =
        leftmostSibling.position?.x ??
        parentX + (parentNode.measured?.width ?? DEFAULT_NODE_WIDTH) + DEFAULT_HORIZONTAL_SPACING;
    }

    return {
      x: newNodeX,
      y: lastSiblingBottom + DEFAULT_VERTICAL_SPACING,
    };
  }
};

/**
 * Gets the initial position for the first child node based on layout type.
 *
 * Alignment rules for horizontal layouts:
 * - Right children: left edge of child aligns with (parent right edge + spacing)
 * - Left children: right edge of child aligns with (parent left edge - spacing)
 *   So we position at: parentX - spacing - nodeWidth
 *
 * Alignment rules for vertical layouts:
 * - Bottom children: top edge of child aligns with (parent bottom edge + spacing)
 * - Top children: bottom edge of child aligns with (parent top edge - spacing)
 */
const getInitialChildPosition = (
  parentX: number,
  parentY: number,
  side: Side | 'mid',
  layoutType: LayoutType,
  parentNode?: MindMapNode
): XYPosition => {
  const isVerticalFlow =
    layoutType === LAYOUT_TYPE.VERTICAL_BALANCED ||
    layoutType === LAYOUT_TYPE.TOP_ONLY ||
    layoutType === LAYOUT_TYPE.BOTTOM_ONLY;

  const parentWidth = parentNode?.measured?.width ?? DEFAULT_NODE_WIDTH;
  const parentHeight = parentNode?.measured?.height ?? DEFAULT_NODE_HEIGHT;

  if (isVerticalFlow) {
    // Vertical layouts: offset in y-direction
    const yOffset =
      side === SIDE.TOP
        ? -DEFAULT_VERTICAL_SPACING - DEFAULT_NODE_HEIGHT
        : DEFAULT_VERTICAL_SPACING + parentHeight;
    return {
      x: parentX,
      y: parentY + yOffset,
    };
  } else {
    // Horizontal layouts: offset in x-direction
    // For right side: position at parent's right edge + spacing (left edge alignment)
    // For left side: position at parent's left edge - spacing - node width (right edge alignment)
    const xOffset =
      side === SIDE.LEFT
        ? -DEFAULT_HORIZONTAL_SPACING - DEFAULT_NODE_WIDTH
        : DEFAULT_HORIZONTAL_SPACING + parentWidth;
    return {
      x: parentX + xOffset,
      y: parentY,
    };
  }
};

export interface NodeOperationsState {
  nodesToBeDeleted: Set<string>;
  addNode: (data?: NewNodeData) => void;
  addChildNode: (
    parentNode: Partial<MindMapNode>,
    position: XYPosition,
    side: string,
    nodeType?: MindMapTypes
  ) => void;
  updateNodeData: (nodeId: string, updates: Partial<MindMapNode['data']>) => void;
  updateNodeDataWithUndo: (nodeId: string, updates: Partial<MindMapNode['data']>) => void;
  markNodeForDeletion: () => void;
  finalizeNodeDeletion: () => void;
  deleteNodesInstant: () => void;
}

export const useNodeOperationsStore = create<NodeOperationsState>()(
  devtools(
    (set, get) => ({
      nodesToBeDeleted: new Set<string>(),

      addNode: (data?: NewNodeData) => {
        const { nodes, setNodes } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        const newNode: MindMapNode = {
          id: generateId(),
          type: MINDMAP_TYPES.ROOT_NODE,
          position: data?.position || {
            x: Math.random() * 500 + 100,
            y: Math.random() * 400 + 100,
          },
          data: {
            level: 0,
            content: data?.content || `<p>New Node ${nodes.length + 1}</p>`,
            side: SIDE.MID,
            isCollapsed: false,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
          style: {
            width: 'fit-content',
            height: 'fit-content',
          },
        };

        setNodes((state) => [...state, newNode]);

        pushToUndoStack();
      },

      addChildNode: (
        parentNode: Partial<MindMapNode>,
        position: XYPosition,
        side: Side | 'mid',
        nodeType: MindMapTypes = MINDMAP_TYPES.TEXT_NODE
      ) => {
        const { nodes, setNodes, setEdges, edges } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        const { applyAutoLayout } = useLayoutStore.getState();
        const isAutoLayoutEnabled = getTreeForceLayout(nodes);
        const layoutType = getTreeLayoutType(nodes);
        prepareToPushUndo();

        // Get the full parent node from the store to ensure we have position and measured data
        const fullParentNode = nodes.find((n) => n.id === parentNode.id);
        if (!fullParentNode) {
          console.error('Parent node not found');
          return;
        }

        // Find the root node to get the pathType
        const rootNode = getRootNodeOfSubtree(fullParentNode.id, nodes);
        const pathType = (rootNode?.data?.pathType || PATH_TYPES.SMOOTHSTEP) as PathType;

        // Find existing children of this parent
        const allChildren = edges
          .filter((edge) => edge.source === fullParentNode.id)
          .map((edge) => nodes.find((n) => n.id === edge.target))
          .filter((n): n is MindMapNode => n !== undefined);

        // For balanced layouts, filter children by side to calculate sibling order
        const isBalancedLayout =
          layoutType === LAYOUT_TYPE.HORIZONTAL_BALANCED || layoutType === LAYOUT_TYPE.VERTICAL_BALANCED;

        const siblingsOnSameSide = isBalancedLayout
          ? allChildren.filter((child) => child.data?.side === side)
          : allChildren;

        // Calculate position after the last sibling using full parent node data
        const newPosition = calculatePositionAfterLastSibling(
          fullParentNode,
          siblingsOnSameSide,
          side,
          layoutType,
          position
        );

        const id = generateId();
        const newNode: MindMapNode = {
          id,
          type: nodeType,
          data: {
            level: fullParentNode.data?.level ? fullParentNode.data.level + 1 : 1,
            content: `<p> New node ${allChildren.length + 1}</p>`,
            parentId: fullParentNode.id,
            side: side,
            isCollapsed: false,
            ...(nodeType === MINDMAP_TYPES.SHAPE_NODE && {
              shape: 'rectangle' as const,
              width: 120,
              height: 60,
            }),
            ...(nodeType === MINDMAP_TYPES.IMAGE_NODE && {
              width: 250,
              height: 180,
              alt: 'Image',
            }),
          },
          measured: {
            width: DEFAULT_NODE_WIDTH,
            height: DEFAULT_NODE_HEIGHT,
          },
          dragHandle: DRAGHANDLE.SELECTOR,
          position: newPosition,
        };

        const newEdge = {
          id: generateId(),
          source: fullParentNode.id,
          target: newNode.id,
          type: MINDMAP_TYPES.EDGE,
          sourceHandle: `${side}-source-${fullParentNode.id}`,
          targetHandle: `${getOppositeSide(side)}-target-${newNode.id}`,
          data: {
            strokeColor: (rootNode?.data.edgeColor as string) || '#0044FF',
            strokeWidth: 2,
            pathType,
          },
        };

        setNodes((state) => [...state, newNode]);
        setEdges((state) => [...state, newEdge]);

        // Only apply auto-layout if it's enabled
        if (isAutoLayoutEnabled && rootNode) {
          setTimeout(() => {
            applyAutoLayout(rootNode.id);
          }, 200);
        }

        pushToUndoStack();
      },

      updateNodeData: (nodeId: string, updates: Partial<MindMapNode['data']>) => {
        const { setNodes } = useCoreStore.getState();
        setNodes((state) =>
          state.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node))
        );
      },

      updateNodeDataWithUndo: (nodeId: string, updates: Partial<MindMapNode['data']>) => {
        const { setNodes } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();
        setNodes((state) =>
          state.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node))
        );

        pushToUndoStack();
      },

      markNodeForDeletion: () => {
        const { nodes, setNodes, setEdges } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);

        // Collect all nodes to delete (including descendants)
        const allNodesToDelete = new Set<string>();
        selectedNodeIds.forEach((nodeId) => {
          const descendantNodes = getAllDescendantNodes(nodeId, nodes);
          allNodesToDelete.add(nodeId);
          descendantNodes.forEach((descendant) => allNodesToDelete.add(descendant.id));
        });

        set({ nodesToBeDeleted: allNodesToDelete });

        setNodes((state) =>
          state.map((node: MindMapNode) =>
            allNodesToDelete.has(node.id) ? { ...node, data: { ...node.data, isDeleting: true } } : node
          )
        );

        setEdges((state) =>
          state.map((edge: MindMapEdge) =>
            allNodesToDelete.has(edge.source) || allNodesToDelete.has(edge.target)
              ? { ...edge, data: { ...edge.data, isDeleting: true } }
              : edge
          )
        );

        pushToUndoStack();
      },

      finalizeNodeDeletion: () => {
        const { nodes, setNodes, setEdges } = useCoreStore.getState();
        const { applyAutoLayout } = useLayoutStore.getState();

        const nodeIdsToDelete = get().nodesToBeDeleted;
        if (nodeIdsToDelete.size === 0) return;

        // Find affected root nodes before deletion
        const affectedRootNodes = new Set<string>();
        nodeIdsToDelete.forEach((nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          if (node) {
            const rootNode = getRootNodeOfSubtree(nodeId, nodes);
            if (rootNode) {
              affectedRootNodes.add(rootNode.id);
            }
          }
        });

        // Check if auto-layout is enabled
        const isAutoLayoutEnabled = getTreeForceLayout(nodes);

        setNodes((state) => state.filter((node) => !nodeIdsToDelete.has(node.id)));
        setEdges((state) =>
          state.filter((edge) => !nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target))
        );

        set({ nodesToBeDeleted: new Set() });

        // Trigger auto-layout for affected trees if enabled
        if (isAutoLayoutEnabled) {
          setTimeout(() => {
            affectedRootNodes.forEach((rootId) => {
              const stillExists = useCoreStore.getState().nodes.find((n) => n.id === rootId);
              if (stillExists) {
                applyAutoLayout(rootId);
              }
            });
          }, 200);
        }
      },

      deleteNodesInstant: () => {
        const { nodes, setNodes, setEdges } = useCoreStore.getState();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        const { applyAutoLayout } = useLayoutStore.getState();
        prepareToPushUndo();

        const selectedNodeIds = nodes.filter((node) => node.selected).map((node) => node.id);

        // Collect all nodes to delete (including descendants)
        const allNodesToDelete = new Set<string>();
        const affectedRootNodes = new Set<string>();

        selectedNodeIds.forEach((nodeId) => {
          const descendantNodes = getAllDescendantNodes(nodeId, nodes);
          allNodesToDelete.add(nodeId);
          descendantNodes.forEach((descendant) => allNodesToDelete.add(descendant.id));

          // Track affected root node for auto-layout
          const rootNode = getRootNodeOfSubtree(nodeId, nodes);
          if (rootNode) {
            affectedRootNodes.add(rootNode.id);
          }
        });

        // Check if auto-layout is enabled
        const isAutoLayoutEnabled = getTreeForceLayout(nodes);

        // Immediately delete without animation
        setNodes((state) => state.filter((node) => !allNodesToDelete.has(node.id)));
        setEdges((state) =>
          state.filter((edge) => !allNodesToDelete.has(edge.source) && !allNodesToDelete.has(edge.target))
        );

        set({ nodesToBeDeleted: new Set() });
        pushToUndoStack();

        // Trigger auto-layout if enabled (Issue #4 fix)
        if (isAutoLayoutEnabled) {
          setTimeout(() => {
            affectedRootNodes.forEach((rootId) => {
              const stillExists = useCoreStore.getState().nodes.find((n) => n.id === rootId);
              if (stillExists) {
                applyAutoLayout(rootId);
              }
            });
          }, 200);
        }
      },
    }),
    { name: 'NodeOperationsStore' }
  )
);
