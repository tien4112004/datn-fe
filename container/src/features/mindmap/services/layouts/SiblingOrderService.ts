import type { LayoutType, NodePositionInfo, SiblingOrderMap, OrderAxis } from '../../types';
import { LAYOUT_CONFIGS } from '../../types';

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
 * Infers sibling order from current node positions based on layout type.
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

  const config = LAYOUT_CONFIGS[layoutType];
  const { orderAxis, orderDirection } = config;
  const ascending = orderDirection === 'ascending';

  const sortedIds = sortByAxis(siblings, orderAxis, ascending, parentPosition);

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
};
