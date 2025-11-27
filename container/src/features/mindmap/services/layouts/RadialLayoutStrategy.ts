import type { LayoutResult, LayoutOptions, EdgeHandleInfo, HandlePosition, LayoutType } from '../../types';
import type { MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_TYPE, SIDE, MINDMAP_TYPES } from '../../types';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';

/**
 * Radial Layout Strategy
 *
 * Children are positioned in a circle around their parent node.
 * This creates a radial/circular mindmap layout.
 *
 * Characteristics:
 * - Children are distributed around parent at equal angular intervals
 * - Sibling order determined by angle (clockwise from top)
 * - All 4 handles are active; selection based on angle to child
 * - Radius increases with tree depth
 * - Sides are determined by angle quadrant
 */
export class RadialLayoutStrategy extends BaseLayoutStrategy {
  readonly type: LayoutType = LAYOUT_TYPE.RADIAL;

  /**
   * Calculates the angle for a child based on its position among siblings.
   * Angle 0 is at the top (12 o'clock), increasing clockwise.
   *
   * @param index - The index of the child among siblings
   * @param totalSiblings - Total number of siblings
   * @param startAngle - Starting angle offset (degrees)
   * @param spreadAngle - Total angle spread for all siblings (degrees)
   * @returns Angle in radians
   */
  private calculateChildAngle(
    index: number,
    totalSiblings: number,
    startAngle: number = 0,
    spreadAngle: number = 360
  ): number {
    if (totalSiblings === 1) {
      // Single child: place at the start angle
      return (startAngle * Math.PI) / 180;
    }

    // Distribute children evenly within the spread angle
    const angleStep = spreadAngle / totalSiblings;
    const angleDegrees = startAngle + index * angleStep + angleStep / 2;

    return (angleDegrees * Math.PI) / 180;
  }

  /**
   * Converts an angle to X,Y offset from parent center.
   *
   * @param angle - Angle in radians (0 = top, increasing clockwise)
   * @param radius - Distance from parent center
   * @returns Object with x and y offsets
   */
  private angleToOffset(angle: number, radius: number): { x: number; y: number } {
    // Convert from "0 = top, clockwise" to standard math coordinates
    // Standard: 0 = right, counterclockwise
    // We want: 0 = top, clockwise
    // So we need to: subtract 90° and negate
    const mathAngle = -angle + Math.PI / 2;

    return {
      x: Math.cos(mathAngle) * radius,
      y: -Math.sin(mathAngle) * radius, // Negate because Y increases downward in screen coords
    };
  }

  /**
   * Determines which handle position to use based on angle from parent.
   * Divides the circle into 4 quadrants centered on each cardinal direction.
   *
   * @param angle - Angle in radians (0 = top, clockwise)
   * @returns The handle position to use
   */
  private getHandleFromAngle(angle: number): HandlePosition {
    // Normalize angle to 0-2π range
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const degrees = (normalizedAngle * 180) / Math.PI;

    // Divide circle into quadrants centered on cardinal directions
    // Top: 315° to 45° (inclusive of 0°)
    // Right: 45° to 135°
    // Bottom: 135° to 225°
    // Left: 225° to 315°

    if (degrees >= 315 || degrees < 45) {
      return 'top';
    } else if (degrees >= 45 && degrees < 135) {
      return 'right';
    } else if (degrees >= 135 && degrees < 225) {
      return 'bottom';
    } else {
      return 'left';
    }
  }

  /**
   * Determines the side based on angle.
   * Left half of circle = 'left' side, right half = 'right' side.
   */
  private getSideFromAngle(angle: number): Side {
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const degrees = (normalizedAngle * 180) / Math.PI;

    // Left side: 180° to 360° (or 0°)
    // Right side: 0° to 180°
    if (degrees > 180) {
      return SIDE.LEFT;
    } else {
      return SIDE.RIGHT;
    }
  }

  /**
   * Gets the opposite handle position.
   */
  private getOppositeHandle(handle: HandlePosition): HandlePosition {
    const opposites: Record<HandlePosition, HandlePosition> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    return opposites[handle];
  }

  /**
   * Recursively positions nodes in a radial layout.
   */
  private positionNodesRadially(
    _parentNode: MindMapNode,
    parentX: number,
    parentY: number,
    children: MindMapNode[],
    childrenMap: Map<string, MindMapNode[]>,
    level: number,
    baseRadius: number,
    radiusIncrement: number,
    startAngle: number,
    spreadAngle: number,
    positionedNodes: Map<string, { x: number; y: number; angle: number }>
  ): void {
    if (children.length === 0) return;

    const radius = baseRadius + level * radiusIncrement;

    children.forEach((child, index) => {
      const angle = this.calculateChildAngle(index, children.length, startAngle, spreadAngle);
      const offset = this.angleToOffset(angle, radius);

      const childWidth = child.measured?.width ?? 0;
      const childHeight = child.measured?.height ?? 0;

      // Position child, centering the node on the calculated point
      const childX = parentX + offset.x - childWidth / 2;
      const childY = parentY + offset.y - childHeight / 2;

      positionedNodes.set(child.id, { x: childX, y: childY, angle });

      // Recursively position grandchildren
      const grandchildren = childrenMap.get(child.id) || [];
      if (grandchildren.length > 0) {
        // Grandchildren get a narrower spread angle
        const childSpreadAngle = Math.min((spreadAngle / children.length) * 1.5, 120);
        const childStartAngle = (angle * 180) / Math.PI - childSpreadAngle / 2;

        this.positionNodesRadially(
          child,
          childX + childWidth / 2,
          childY + childHeight / 2,
          grandchildren,
          childrenMap,
          level + 1,
          baseRadius,
          radiusIncrement,
          childStartAngle,
          childSpreadAngle,
          positionedNodes
        );
      }
    });
  }

  async calculateLayout(
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> {
    const allNodes = [rootNode, ...descendants];

    if (allNodes.length <= 1) {
      return { nodes: allNodes, edges };
    }

    const baseRadius = options.baseRadius ?? 200;
    const radiusIncrement = options.radiusIncrement ?? 150;

    const rootX = rootNode.position?.x ?? 0;
    const rootY = rootNode.position?.y ?? 0;
    const rootWidth = rootNode.measured?.width ?? 0;
    const rootHeight = rootNode.measured?.height ?? 0;

    // Build children map (sorted by siblingOrder)
    const childrenMap = this.groupByParent(descendants);

    // Track positioned nodes with their angles
    const positionedNodes = new Map<string, { x: number; y: number; angle: number }>();

    // Position root at its current position
    positionedNodes.set(rootNode.id, { x: rootX, y: rootY, angle: 0 });

    // Get direct children of root
    const rootChildren = childrenMap.get(rootNode.id) || [];

    // Position all descendants radially
    this.positionNodesRadially(
      rootNode,
      rootX + rootWidth / 2, // Center of root
      rootY + rootHeight / 2,
      rootChildren,
      childrenMap,
      1,
      baseRadius,
      radiusIncrement,
      0, // Start from top (0°)
      360, // Full circle
      positionedNodes
    );

    // Build the result nodes with updated positions and sides
    const layoutedNodes: MindMapNode[] = allNodes.map((node) => {
      const posInfo = positionedNodes.get(node.id);

      if (!posInfo) {
        return node;
      }

      // Determine side based on angle (for non-root nodes)
      let side: Side = node.data.side;
      if (node.type !== MINDMAP_TYPES.ROOT_NODE && posInfo.angle !== undefined) {
        side = this.getSideFromAngle(posInfo.angle);
      }

      return {
        ...node,
        position: { x: posInfo.x, y: posInfo.y },
        data: {
          ...node.data,
          side: node.type === MINDMAP_TYPES.ROOT_NODE ? SIDE.MID : side,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }

  getEdgeHandles(parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo {
    // Calculate angle from parent to child
    const parentX = (parentNode.position?.x ?? 0) + (parentNode.measured?.width ?? 0) / 2;
    const parentY = (parentNode.position?.y ?? 0) + (parentNode.measured?.height ?? 0) / 2;
    const childX = (childNode.position?.x ?? 0) + (childNode.measured?.width ?? 0) / 2;
    const childY = (childNode.position?.y ?? 0) + (childNode.measured?.height ?? 0) / 2;

    const dx = childX - parentX;
    const dy = childY - parentY;

    // Calculate angle (0 = top, clockwise)
    let angle = Math.atan2(dx, -dy);
    if (angle < 0) angle += 2 * Math.PI;

    const sourceHandle = this.getHandleFromAngle(angle);
    const targetHandle = this.getOppositeHandle(sourceHandle);

    return { sourceHandle, targetHandle };
  }

  getDefaultChildSide(_parentNode: MindMapNode, existingChildren: MindMapNode[]): Side {
    // For radial layout, balance children between left and right sides
    const leftCount = existingChildren.filter((c) => c.data.side === SIDE.LEFT).length;
    const rightCount = existingChildren.filter((c) => c.data.side === SIDE.RIGHT).length;

    // Add to the side with fewer children
    return leftCount <= rightCount ? SIDE.LEFT : SIDE.RIGHT;
  }
}

/**
 * Singleton instance
 */
export const radialLayoutStrategy = new RadialLayoutStrategy();
