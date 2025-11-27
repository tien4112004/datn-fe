import type { LayoutResult, LayoutOptions, EdgeHandleInfo, LayoutType } from '../../types';
import type { MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_TYPE, SIDE, DIRECTION } from '../../types';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';
import { d3LayoutService } from '../D3LayoutService';
import { layoutTransitionService } from './LayoutTransitionService';

/**
 * Horizontal Balanced Layout Strategy
 *
 * Children are distributed on both LEFT and RIGHT sides of the parent.
 * This creates a balanced horizontal tree flowing outward from the center.
 *
 * Characteristics:
 * - Children alternate between LEFT and RIGHT sides for balance
 * - Sibling order determined by Y position (top to bottom)
 * - Uses left/right handles for connections
 * - Root node has MID side, children have LEFT or RIGHT
 */
export class HorizontalBalancedLayoutStrategy extends BaseLayoutStrategy {
  readonly type: LayoutType = LAYOUT_TYPE.HORIZONTAL_BALANCED;

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

    // First, assign sides to nodes using the transition service
    const nodesWithSides = layoutTransitionService.assignSides(allNodes, this.type);

    // Use D3LayoutService for positioning (it handles horizontal layout well)
    const { nodes: layoutedNodes, edges: layoutedEdges } = await d3LayoutService.layoutSubtree(
      nodesWithSides.find((n) => n.id === rootNode.id) || rootNode,
      nodesWithSides.filter((n) => n.id !== rootNode.id),
      edges,
      DIRECTION.HORIZONTAL
    );

    // Update edge handles to use the new format
    const updatedEdges = this.updateEdgeHandles(layoutedEdges, layoutedNodes);

    return { nodes: layoutedNodes, edges: updatedEdges };
  }

  getEdgeHandles(_parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo {
    const childSide = childNode.data.side;

    // Source handle: where the child is relative to parent
    // Target handle: opposite side (where parent is relative to child)
    if (childSide === SIDE.LEFT) {
      return {
        sourceHandle: 'left',
        targetHandle: 'right',
      };
    } else {
      return {
        sourceHandle: 'right',
        targetHandle: 'left',
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
export const horizontalBalancedLayoutStrategy = new HorizontalBalancedLayoutStrategy();
