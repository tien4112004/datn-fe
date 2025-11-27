import type { LayoutType, NodePositionInfo, SiblingOrderMap, OrderAxis } from '../types';
import { LAYOUT_CONFIGS } from '../types';

/**
 * Service for inferring sibling order from node positions.
 * This enables relative position preservation when auto-layout runs.
 */
class SiblingOrderService {
  /**
   * Calculates the angle (in degrees) from a parent position to a child position.
   * Angle 0 is at the top (12 o'clock), increasing clockwise.
   *
   * @param parentX - Parent node X coordinate
   * @param parentY - Parent node Y coordinate
   * @param childX - Child node X coordinate
   * @param childY - Child node Y coordinate
   * @returns Angle in degrees (0-360)
   */
  private calculateAngle(parentX: number, parentY: number, childX: number, childY: number): number {
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
  }

  /**
   * Sorts siblings by their position on the specified axis.
   *
   * @param siblings - Array of sibling nodes with positions
   * @param axis - The axis to sort by ('x', 'y', or 'angle')
   * @param ascending - Whether to sort ascending or descending
   * @param parentPosition - Parent position (required for angle-based sorting)
   * @returns Array of node IDs in sorted order
   */
  private sortByAxis(
    siblings: NodePositionInfo[],
    axis: OrderAxis,
    ascending: boolean,
    parentPosition?: { x: number; y: number }
  ): string[] {
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
          valueA = this.calculateAngle(parentPosition.x, parentPosition.y, a.x, a.y);
          valueB = this.calculateAngle(parentPosition.x, parentPosition.y, b.x, b.y);
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
  }

  /**
   * Infers sibling order from current node positions based on layout type.
   *
   * @param siblings - Array of sibling nodes with their current positions
   * @param layoutType - The current layout type
   * @param parentPosition - Position of the parent node (needed for radial layouts)
   * @returns Map of node IDs to their new sibling order values
   */
  inferOrderFromPositions(
    siblings: NodePositionInfo[],
    layoutType: LayoutType,
    parentPosition?: { x: number; y: number }
  ): SiblingOrderMap {
    if (siblings.length === 0) {
      return {};
    }

    if (siblings.length === 1) {
      return { [siblings[0].id]: 0 };
    }

    const config = LAYOUT_CONFIGS[layoutType];
    const { orderAxis, orderDirection } = config;
    const ascending = orderDirection === 'ascending';

    const sortedIds = this.sortByAxis(siblings, orderAxis, ascending, parentPosition);

    const orderMap: SiblingOrderMap = {};
    sortedIds.forEach((id, index) => {
      orderMap[id] = index;
    });

    return orderMap;
  }

  /**
   * Groups nodes by their parent and side, then infers order for each group.
   *
   * @param nodes - Array of nodes with positions
   * @param layoutType - The current layout type
   * @param parentPositions - Map of parent IDs to their positions
   * @returns Map of node IDs to their new sibling order values
   */
  inferOrderForAllNodes(
    nodes: NodePositionInfo[],
    layoutType: LayoutType,
    parentPositions: Map<string, { x: number; y: number }>
  ): SiblingOrderMap {
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

      const groupOrders = this.inferOrderFromPositions(siblings, layoutType, parentPosition);
      Object.assign(allOrders, groupOrders);
    }

    return allOrders;
  }

  /**
   * Detects if a node has been dragged to a position that suggests reordering.
   * Returns true if the node's position relative to its siblings has changed.
   *
   * @param nodeId - The ID of the dragged node
   * @param newPosition - The new position of the dragged node
   * @param siblings - Current sibling nodes with their positions
   * @param layoutType - The current layout type
   * @param parentPosition - Position of the parent node
   * @returns Object containing whether reordering is needed and the new orders
   */
  detectReorderFromDrag(
    nodeId: string,
    newPosition: { x: number; y: number },
    siblings: NodePositionInfo[],
    layoutType: LayoutType,
    parentPosition?: { x: number; y: number }
  ): { shouldReorder: boolean; newOrders: SiblingOrderMap } {
    // Find the current node in siblings and update its position
    const updatedSiblings = siblings.map((s) =>
      s.id === nodeId ? { ...s, x: newPosition.x, y: newPosition.y } : s
    );

    // Get new orders based on updated positions
    const newOrders = this.inferOrderFromPositions(updatedSiblings, layoutType, parentPosition);

    // Check if the order for the dragged node changed
    const originalNode = siblings.find((s) => s.id === nodeId);
    const originalOrders = this.inferOrderFromPositions(siblings, layoutType, parentPosition);

    const shouldReorder = originalNode ? originalOrders[nodeId] !== newOrders[nodeId] : false;

    return { shouldReorder, newOrders };
  }

  /**
   * Gets the next available sibling order for a new child node.
   *
   * @param existingSiblings - Array of existing siblings with their siblingOrder values
   * @returns The next sibling order value to assign
   */
  getNextSiblingOrder(existingSiblings: Array<{ siblingOrder?: number }>): number {
    if (existingSiblings.length === 0) {
      return 0;
    }

    const maxOrder = Math.max(...existingSiblings.map((s) => s.siblingOrder ?? -1));

    return maxOrder + 1;
  }

  /**
   * Normalizes sibling order values to be sequential (0, 1, 2, ...).
   * Useful after deletions that may leave gaps in the order sequence.
   *
   * @param siblings - Array of sibling nodes with siblingOrder
   * @returns Map of node IDs to normalized sibling order values
   */
  normalizeSiblingOrders(siblings: Array<{ id: string; siblingOrder?: number }>): SiblingOrderMap {
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
  }
}

/**
 * Singleton instance of SiblingOrderService
 */
export const siblingOrderService = new SiblingOrderService();
