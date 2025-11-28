import type { LayoutType, NodePositionInfo, SiblingOrderMap, OrderAxis, MindMapNode } from '../../types';
import { LAYOUT_CONFIGS, LAYOUT_TYPE, MINDMAP_TYPES } from '../../types';

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Calculates the angle (in degrees) from a parent position to a child position.
 * Angle 0 is at the top (12 o'clock), increasing clockwise.
 */
const calculateAngle = (parentX: number, parentY: number, childX: number, childY: number): number => {
  const dx = childX - parentX;
  const dy = childY - parentY;

  // atan2 returns angle from positive X axis, counterclockwise
  // We want angle from positive Y axis (top), clockwise
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);

  // Normalize to 0-360 range
  if (angle < 0) {
    angle += 360;
  }

  return angle;
};

/**
 * Sorts siblings by their position on the specified axis.
 */
const sortByAxis = (
  siblings: NodePositionInfo[],
  axis: OrderAxis,
  ascending: boolean,
  parentPosition?: { x: number; y: number }
): string[] => {
  const sortedSiblings = [...siblings];

  sortedSiblings.sort((a, b) => {
    let valueA: number;
    let valueB: number;

    if (axis === 'angle') {
      if (!parentPosition) {
        // Fallback to Y if no parent position provided
        valueA = a.y;
        valueB = b.y;
      } else {
        valueA = calculateAngle(parentPosition.x, parentPosition.y, a.x, a.y);
        valueB = calculateAngle(parentPosition.x, parentPosition.y, b.x, b.y);
      }
    } else if (axis === 'x') {
      valueA = a.x;
      valueB = b.x;
    } else {
      valueA = a.y;
      valueB = b.y;
    }

    const comparison = valueA - valueB;
    return ascending ? comparison : -comparison;
  });

  return sortedSiblings.map((s) => s.id);
};

/**
 * Sorts siblings for horizontal balanced layout.
 * Groups by relative X position to parent (left/right of parent), then sorts each group by Y position.
 * Left group (x < parent.x): top to bottom (ascending Y)
 * Right group (x >= parent.x): top to bottom (ascending Y)
 * Order: left nodes first (top to bottom), then right nodes (top to bottom)
 */
const sortForHorizontalBalanced = (
  siblings: NodePositionInfo[],
  parentPosition?: { x: number; y: number }
): string[] => {
  const parentX = parentPosition?.x ?? 0;

  // Group by actual position relative to parent
  const leftNodes = siblings.filter((s) => s.x < parentX);
  const rightNodes = siblings.filter((s) => s.x >= parentX);

  // Sort each group by Y position (top to bottom)
  const sortByY = (nodes: NodePositionInfo[]) => [...nodes].sort((a, b) => a.y - b.y);

  const sortedLeft = sortByY(leftNodes);
  const sortedRight = sortByY(rightNodes);

  // Combine: left first, then right
  return [...sortedLeft, ...sortedRight].map((s) => s.id);
};

/**
 * Sorts siblings for vertical balanced layout.
 * Groups by relative Y position to parent (above/below parent), then sorts each group by X position.
 * Top group (y < parent.y): left to right (ascending X)
 * Bottom group (y >= parent.y): left to right (ascending X)
 * Order: top nodes first (left to right), then bottom nodes (left to right)
 */
const sortForVerticalBalanced = (
  siblings: NodePositionInfo[],
  parentPosition?: { x: number; y: number }
): string[] => {
  const parentY = parentPosition?.y ?? 0;

  // Group by actual position relative to parent
  const topNodes = siblings.filter((s) => s.y < parentY);
  const bottomNodes = siblings.filter((s) => s.y >= parentY);

  // Sort each group by X position (left to right)
  const sortByX = (nodes: NodePositionInfo[]) => [...nodes].sort((a, b) => a.x - b.x);

  const sortedTop = sortByX(topNodes);
  const sortedBottom = sortByX(bottomNodes);

  // Combine: top first, then bottom
  return [...sortedTop, ...sortedBottom].map((s) => s.id);
};

/**
 * Infers sibling order from current node positions based on layout type.
 *
 * Sorting criteria by layout type:
 * - LEFT_ONLY / RIGHT_ONLY: Sort by vertical position (Y axis, top to bottom)
 * - TOP_ONLY / BOTTOM_ONLY: Sort by horizontal position (X axis, left to right)
 * - HORIZONTAL_BALANCED: Group by relative X position to parent (left/right), then sort by Y within each group
 * - VERTICAL_BALANCED: Group by relative Y position to parent (top/bottom), then sort by X within each group
 */
export const inferOrderFromPositions = (
  siblings: NodePositionInfo[],
  layoutType: LayoutType,
  parentPosition?: { x: number; y: number }
): SiblingOrderMap => {
  if (siblings.length === 0) {
    return {};
  }

  if (siblings.length === 1) {
    return { [siblings[0].id]: 0 };
  }

  let sortedIds: string[];

  // Use layout-specific sorting for balanced layouts
  switch (layoutType) {
    case LAYOUT_TYPE.HORIZONTAL_BALANCED:
      sortedIds = sortForHorizontalBalanced(siblings, parentPosition);
      break;

    case LAYOUT_TYPE.VERTICAL_BALANCED:
      sortedIds = sortForVerticalBalanced(siblings, parentPosition);
      break;

    default: {
      // Use axis-based sorting for directional layouts
      const config = LAYOUT_CONFIGS[layoutType];
      const { orderAxis, orderDirection } = config;
      const ascending = orderDirection === 'ascending';
      sortedIds = sortByAxis(siblings, orderAxis, ascending, parentPosition);
      break;
    }
  }

  const orderMap: SiblingOrderMap = {};
  sortedIds.forEach((id, index) => {
    orderMap[id] = index;
  });

  return orderMap;
};

/**
 * Groups nodes by their parent and side, then infers order for each group.
 */
export const inferOrderForAllNodes = (
  nodes: NodePositionInfo[],
  layoutType: LayoutType,
  parentPositions: Map<string, { x: number; y: number }>
): SiblingOrderMap => {
  // Group nodes by parent and side
  const groups = new Map<string, NodePositionInfo[]>();

  for (const node of nodes) {
    if (!node.parentId) continue;

    const groupKey = `${node.parentId}-${node.side}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(node);
  }

  // Infer order for each group
  const allOrders: SiblingOrderMap = {};

  for (const [groupKey, siblings] of groups) {
    const parentId = groupKey.split('-')[0];
    const parentPosition = parentPositions.get(parentId);

    const groupOrders = inferOrderFromPositions(siblings, layoutType, parentPosition);
    Object.assign(allOrders, groupOrders);
  }

  return allOrders;
};

/**
 * Detects if a node has been dragged to a position that suggests reordering.
 * Returns true if the node's position relative to its siblings has changed.
 */
export const detectReorderFromDrag = (
  nodeId: string,
  newPosition: { x: number; y: number },
  siblings: NodePositionInfo[],
  layoutType: LayoutType,
  parentPosition?: { x: number; y: number }
): { shouldReorder: boolean; newOrders: SiblingOrderMap } => {
  // Find the current node in siblings and update its position
  const updatedSiblings = siblings.map((s) =>
    s.id === nodeId ? { ...s, x: newPosition.x, y: newPosition.y } : s
  );

  // Get new orders based on updated positions
  const newOrders = inferOrderFromPositions(updatedSiblings, layoutType, parentPosition);

  // Check if the order for the dragged node changed
  const originalNode = siblings.find((s) => s.id === nodeId);
  const originalOrders = inferOrderFromPositions(siblings, layoutType, parentPosition);

  const shouldReorder = originalNode ? originalOrders[nodeId] !== newOrders[nodeId] : false;

  return { shouldReorder, newOrders };
};

/**
 * Gets the next available sibling order for a new child node.
 */
export const getNextSiblingOrder = (existingSiblings: Array<{ siblingOrder?: number }>): number => {
  if (existingSiblings.length === 0) {
    return 0;
  }

  const maxOrder = Math.max(...existingSiblings.map((s) => s.siblingOrder ?? -1));
  return maxOrder + 1;
};

/**
 * Normalizes sibling order values to be sequential (0, 1, 2, ...).
 * Useful after deletions that may leave gaps in the order sequence.
 */
export const normalizeSiblingOrders = (
  siblings: Array<{ id: string; siblingOrder?: number }>
): SiblingOrderMap => {
  const sorted = [...siblings].sort((a, b) => {
    const orderA = a.siblingOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.siblingOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const orderMap: SiblingOrderMap = {};
  sorted.forEach((sibling, index) => {
    orderMap[sibling.id] = index;
  });

  return orderMap;
};

/**
 * Updates sibling orders on nodes based on their current positions.
 * This should be called BEFORE layout calculation to preserve relative positions.
 *
 * @param nodes - All nodes in the mindmap
 * @param layoutType - The current layout type
 * @returns Nodes with updated siblingOrder values in their data
 */
export const updateSiblingOrdersFromPositions = (
  nodes: MindMapNode[],
  layoutType: LayoutType
): MindMapNode[] => {
  // Build parent position map
  const parentPositions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    if (node.position) {
      parentPositions.set(node.id, { x: node.position.x, y: node.position.y });
    }
  }

  // Convert nodes to NodePositionInfo format
  const positionInfos: NodePositionInfo[] = nodes
    .filter((node) => node.type !== MINDMAP_TYPES.ROOT_NODE && node.position)
    .map((node) => ({
      id: node.id,
      x: node.position!.x,
      y: node.position!.y,
      parentId: node.data.parentId,
      side: node.data.side,
    }));

  // Infer orders for all nodes
  const orderMap = inferOrderForAllNodes(positionInfos, layoutType, parentPositions);

  // Apply orders to nodes
  return nodes.map((node) => {
    const newOrder = orderMap[node.id];
    if (newOrder !== undefined) {
      return {
        ...node,
        data: {
          ...node.data,
          siblingOrder: newOrder,
        },
      };
    }
    return node;
  });
};

// ============================================================================
// Backwards Compatibility - Service Object
// ============================================================================

/**
 * Service object for backwards compatibility.
 * Wraps the pure functions in an object interface.
 */
export const siblingOrderService = {
  inferOrderFromPositions,
  inferOrderForAllNodes,
  detectReorderFromDrag,
  getNextSiblingOrder,
  normalizeSiblingOrders,
  updateSiblingOrdersFromPositions,
};
