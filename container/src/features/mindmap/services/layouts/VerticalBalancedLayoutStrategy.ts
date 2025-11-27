import type { LayoutResult, LayoutOptions, EdgeHandleInfo, LayoutType } from '../../types';
import type { MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_TYPE, SIDE, DIRECTION } from '../../types';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';
import { d3LayoutService } from '../D3LayoutService';
import { layoutTransitionService } from './LayoutTransitionService';

/**
 * Vertical Balanced Layout Strategy
 *
 * Children are distributed on both TOP and BOTTOM sides of the parent.
 * This creates a balanced vertical tree flowing outward from the center.
 *
 * Characteristics:
 * - Children alternate between TOP and BOTTOM sides for balance
 * - Sibling order determined by X position (left to right)
 * - Uses top/bottom handles for connections
 * - Root node has MID side, children have TOP or BOTTOM
 */
export class VerticalBalancedLayoutStrategy extends BaseLayoutStrategy {
  readonly type: LayoutType = LAYOUT_TYPE.VERTICAL_BALANCED;

  async calculateLayout(
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    _options: LayoutOptions
  ): Promise<LayoutResult> {
    const allNodes = [rootNode, ...descendants];

    if (allNodes.length <= 1) {
      return { nodes: allNodes, edges };
    }

    // First, assign sides (TOP/BOTTOM) to nodes
    const nodesWithSides = layoutTransitionService.assignSides(allNodes, this.type);

    // Convert TOP/BOTTOM to LEFT/RIGHT for D3LayoutService compatibility
    // D3LayoutService with VERTICAL direction expects LEFT/RIGHT sides
    const nodesForD3 = nodesWithSides.map((node) => ({
      ...node,
      data: {
        ...node.data,
        side: this.convertSideForD3(node.data.side),
      },
    }));

    // Use D3LayoutService for positioning
    const { nodes: layoutedNodes } = await d3LayoutService.layoutSubtree(
      nodesForD3.find((n) => n.id === rootNode.id) || rootNode,
      nodesForD3.filter((n) => n.id !== rootNode.id),
      edges,
      DIRECTION.VERTICAL
    );

    // Convert sides back to TOP/BOTTOM
    const nodesWithCorrectSides = layoutedNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        side: this.convertSideFromD3(node.data.side),
      },
    }));

    // Update edge handles to use the new format (top/bottom)
    const updatedEdges = this.updateEdgeHandles(edges, nodesWithCorrectSides);

    return { nodes: nodesWithCorrectSides, edges: updatedEdges };
  }

  /**
   * Converts TOP/BOTTOM sides to LEFT/RIGHT for D3LayoutService.
   * D3LayoutService's vertical mode uses LEFT/RIGHT internally.
   */
  private convertSideForD3(side: Side): Side {
    if (side === SIDE.TOP) return SIDE.LEFT;
    if (side === SIDE.BOTTOM) return SIDE.RIGHT;
    return side;
  }

  /**
   * Converts LEFT/RIGHT sides back to TOP/BOTTOM after D3 layout.
   */
  private convertSideFromD3(side: Side): Side {
    if (side === SIDE.LEFT) return SIDE.TOP;
    if (side === SIDE.RIGHT) return SIDE.BOTTOM;
    return side;
  }

  getEdgeHandles(_parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo {
    const childSide = childNode.data.side;

    // Source handle: where the child is relative to parent
    // Target handle: opposite side (where parent is relative to child)
    if (childSide === SIDE.TOP) {
      return {
        sourceHandle: 'top',
        targetHandle: 'bottom',
      };
    } else {
      return {
        sourceHandle: 'bottom',
        targetHandle: 'top',
      };
    }
  }

  getDefaultChildSide(_parentNode: MindMapNode, existingChildren: MindMapNode[]): Side {
    return layoutTransitionService.getNextChildSide(existingChildren, this.type);
  }
}

/**
 * Singleton instance
 */
export const verticalBalancedLayoutStrategy = new VerticalBalancedLayoutStrategy();
