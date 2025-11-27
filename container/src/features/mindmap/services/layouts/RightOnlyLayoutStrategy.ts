import type { LayoutResult, LayoutOptions, EdgeHandleInfo, LayoutType } from '../../types';
import type { MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_TYPE, SIDE, MINDMAP_TYPES } from '../../types';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';
import * as d3 from 'd3';

interface HierarchyNode {
  originalNode: MindMapNode;
  children?: HierarchyNode[];
}

type D3HierarchyNode = d3.HierarchyNode<HierarchyNode> & {
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight?: number;
  children?: D3HierarchyNode[];
  parent?: D3HierarchyNode | null;
};

/**
 * Right-Only Layout Strategy
 *
 * All children extend to the right of their parent node.
 * This creates a classic tree view layout flowing left-to-right.
 *
 * Characteristics:
 * - Children stack vertically to the right of parent
 * - Sibling order determined by Y position (top to bottom)
 * - Uses right handle for source, left handle for target
 * - All nodes assigned to 'right' side regardless of creation method
 */
export class RightOnlyLayoutStrategy extends BaseLayoutStrategy {
  readonly type: LayoutType = LAYOUT_TYPE.RIGHT_ONLY;

  /**
   * Calculates the total height required for a subtree including all its children.
   */
  private calculateSubtreeHeight(node: D3HierarchyNode, verticalSpacing: number): number {
    if (node.subtreeHeight !== undefined) {
      return node.subtreeHeight;
    }

    const nodeHeight = node.height;

    if (!node.children || node.children.length === 0) {
      node.subtreeHeight = nodeHeight;
      return nodeHeight;
    }

    const childrenHeights = node.children.map((child) => this.calculateSubtreeHeight(child, verticalSpacing));
    const totalChildrenHeight = childrenHeights.reduce((sum, height) => sum + height, 0);
    const spacingHeight = (node.children.length - 1) * verticalSpacing;

    node.subtreeHeight = Math.max(nodeHeight, totalChildrenHeight + spacingHeight);

    return node.subtreeHeight;
  }

  /**
   * Preprocesses a hierarchy to add width and height properties.
   */
  private preprocessHierarchy(hierarchy: D3HierarchyNode): void {
    hierarchy.eachBefore((node: D3HierarchyNode) => {
      node.width = node.data.originalNode.measured?.width ?? 0;
      node.height = node.data.originalNode.measured?.height ?? 0;
    });
  }

  /**
   * Builds a hierarchy structure for D3 from a flat node structure.
   */
  private buildSubtree(startNode: MindMapNode, childrenMap: Map<string, MindMapNode[]>): HierarchyNode {
    const children = childrenMap.get(startNode.id) || [];
    return {
      originalNode: startNode,
      children: children.map((child) => this.buildSubtree(child, childrenMap)),
    };
  }

  /**
   * Positions all nodes in the hierarchy.
   * Children are placed to the right of their parent, stacked vertically.
   */
  private positionHierarchy(
    hierarchy: D3HierarchyNode,
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    horizontalSpacing: number,
    verticalSpacing: number
  ): void {
    hierarchy.descendants().forEach((node: D3HierarchyNode) => {
      const originalNode = node.data.originalNode;
      if (!originalNode) return;

      if (originalNode.id === rootNode.id) {
        node.x = rootX;
        node.y = rootY;
      } else if (node.parent) {
        // Position to the right of parent
        node.x = node.parent.x + node.parent.width + horizontalSpacing;

        // Position vertically among siblings
        if (node.parent.children) {
          const siblings = node.parent.children;
          const siblingIndex = siblings.indexOf(node);

          let cumulativeOffset = 0;
          for (let i = 0; i < siblingIndex; i++) {
            cumulativeOffset += (siblings[i].subtreeHeight || 0) + verticalSpacing;
          }

          const totalSubtreesHeight = siblings.reduce(
            (sum, sibling) => sum + (sibling.subtreeHeight || 0),
            0
          );
          const totalSpacing = (siblings.length - 1) * verticalSpacing;
          const totalLayoutHeight = totalSubtreesHeight + totalSpacing;

          if (siblings.length === 1) {
            node.y = node.parent.y + node.parent.height / 2 - node.height / 2;
          } else {
            node.y = node.parent.y + node.parent.height / 2 - totalLayoutHeight / 2 + cumulativeOffset;
          }
        }
      }
    });
  }

  /**
   * Gets the bottom Y coordinate of a subtree.
   */
  private getSubtreeBottomY(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.y + node.height;
    }
    return Math.max(...node.children.map((child) => this.getSubtreeBottomY(child)));
  }

  /**
   * Gets the top Y coordinate of a subtree.
   */
  private getSubtreeTopY(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.y;
    }
    return Math.min(...node.children.map((child) => this.getSubtreeTopY(child)));
  }

  /**
   * Adjusts the position of a subtree by applying offsets.
   */
  private adjustSubtreePosition(node: D3HierarchyNode, yOffset: number): void {
    node.y += yOffset;
    if (node.children) {
      node.children.forEach((child) => this.adjustSubtreePosition(child, yOffset));
    }
  }

  /**
   * Adjusts spacing between sibling subtrees.
   */
  private adjustSpacing(node: D3HierarchyNode, verticalSpacing: number): void {
    if (!node.children || node.children.length <= 1) return;

    const children = node.children;
    const spacingErrors: number[] = [];

    for (let i = 1; i < children.length; i++) {
      const prevBottom = this.getSubtreeBottomY(children[i - 1]);
      const currentTop = this.getSubtreeTopY(children[i]);
      const actualSpacing = currentTop - prevBottom;
      spacingErrors.push(verticalSpacing - actualSpacing);
    }

    if (spacingErrors.some((error) => Math.abs(error) > 0.1)) {
      const totalError = spacingErrors.reduce((sum, error) => sum + error, 0);
      const averageAdjustment = totalError / children.length;

      let cumulativeAdjustment = -averageAdjustment;

      children.forEach((child, index) => {
        if (index > 0) {
          cumulativeAdjustment += spacingErrors[index - 1];
        }
        this.adjustSubtreePosition(child, cumulativeAdjustment);
      });
    }

    children.forEach((child) => this.adjustSpacing(child, verticalSpacing));
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

    const { horizontalSpacing, verticalSpacing } = options;
    const rootX = rootNode.position?.x ?? 0;
    const rootY = rootNode.position?.y ?? 0;

    // Build children map (sorted by siblingOrder)
    const childrenMap = this.groupByParent(descendants);

    // Build hierarchy starting from root
    const tree: HierarchyNode = {
      originalNode: rootNode,
      children: (childrenMap.get(rootNode.id) || []).map((child) => this.buildSubtree(child, childrenMap)),
    };

    const hierarchy = d3.hierarchy<HierarchyNode>(tree) as D3HierarchyNode;

    // Preprocess to add width/height
    this.preprocessHierarchy(hierarchy);

    // Calculate subtree heights
    hierarchy.eachAfter((node: D3HierarchyNode) => {
      node.subtreeHeight = this.calculateSubtreeHeight(node, verticalSpacing);
    });

    // Position all nodes
    this.positionHierarchy(hierarchy, rootX, rootY, rootNode, horizontalSpacing, verticalSpacing);

    // Adjust spacing
    this.adjustSpacing(hierarchy, verticalSpacing);

    // Collect positioned nodes
    const layoutedNodes: MindMapNode[] = [];
    hierarchy.each((node: D3HierarchyNode) => {
      const originalNode = node.data.originalNode;
      if (originalNode) {
        layoutedNodes.push({
          ...originalNode,
          position: { x: node.x, y: node.y },
          // Ensure all nodes are assigned to 'right' side for this layout
          data: {
            ...originalNode.data,
            side: originalNode.type === MINDMAP_TYPES.ROOT_NODE ? SIDE.MID : SIDE.RIGHT,
          },
        });
      }
    });

    return { nodes: layoutedNodes, edges };
  }

  getEdgeHandles(_parentNode: MindMapNode, _childNode: MindMapNode): EdgeHandleInfo {
    // For right-only layout: parent's right handle to child's left handle
    return {
      sourceHandle: 'right',
      targetHandle: 'left',
    };
  }

  getDefaultChildSide(_parentNode: MindMapNode, _existingChildren: MindMapNode[]): Side {
    // All children go to the right in this layout
    return SIDE.RIGHT;
  }
}

/**
 * Singleton instance
 */
export const rightOnlyLayoutStrategy = new RightOnlyLayoutStrategy();
