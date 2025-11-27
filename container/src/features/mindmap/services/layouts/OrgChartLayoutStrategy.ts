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
  subtreeWidth?: number;
  children?: D3HierarchyNode[];
  parent?: D3HierarchyNode | null;
};

/**
 * Org Chart Layout Strategy
 *
 * Children are positioned below their parent, centered horizontally.
 * This creates a traditional organizational chart layout flowing top-to-bottom.
 *
 * Characteristics:
 * - Children stack horizontally below parent, centered
 * - Sibling order determined by X position (left to right)
 * - Uses bottom handle for source, top handle for target
 * - All nodes assigned to 'right' side (meaning 'below' in this context)
 */
export class OrgChartLayoutStrategy extends BaseLayoutStrategy {
  readonly type: LayoutType = LAYOUT_TYPE.ORG_CHART;

  /**
   * Calculates the total width required for a subtree including all its children.
   */
  private calculateSubtreeWidth(node: D3HierarchyNode, horizontalSpacing: number): number {
    if (node.subtreeWidth !== undefined) {
      return node.subtreeWidth;
    }

    const nodeWidth = node.width;

    if (!node.children || node.children.length === 0) {
      node.subtreeWidth = nodeWidth;
      return nodeWidth;
    }

    const childrenWidths = node.children.map((child) => this.calculateSubtreeWidth(child, horizontalSpacing));
    const totalChildrenWidth = childrenWidths.reduce((sum, width) => sum + width, 0);
    const spacingWidth = (node.children.length - 1) * horizontalSpacing;

    node.subtreeWidth = Math.max(nodeWidth, totalChildrenWidth + spacingWidth);

    return node.subtreeWidth;
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
   * Children are placed below their parent, centered horizontally.
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
        // Position below parent
        node.y = node.parent.y + node.parent.height + verticalSpacing;

        // Position horizontally among siblings
        if (node.parent.children) {
          const siblings = node.parent.children;
          const siblingIndex = siblings.indexOf(node);

          let cumulativeOffset = 0;
          for (let i = 0; i < siblingIndex; i++) {
            cumulativeOffset += (siblings[i].subtreeWidth || 0) + horizontalSpacing;
          }

          const totalSubtreesWidth = siblings.reduce((sum, sibling) => sum + (sibling.subtreeWidth || 0), 0);
          const totalSpacing = (siblings.length - 1) * horizontalSpacing;
          const totalLayoutWidth = totalSubtreesWidth + totalSpacing;

          if (siblings.length === 1) {
            // Single child: center below parent
            node.x = node.parent.x + node.parent.width / 2 - node.width / 2;
          } else {
            // Multiple children: distribute horizontally, centered under parent
            const parentCenterX = node.parent.x + node.parent.width / 2;
            const layoutStartX = parentCenterX - totalLayoutWidth / 2;

            // Position this node at its offset, accounting for subtree centering
            const subtreeOffset = (node.subtreeWidth || node.width) / 2 - node.width / 2;
            node.x = layoutStartX + cumulativeOffset + subtreeOffset;
          }
        }
      }
    });
  }

  /**
   * Gets the rightmost X coordinate of a subtree.
   */
  private getSubtreeRightX(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.x + node.width;
    }
    return Math.max(...node.children.map((child) => this.getSubtreeRightX(child)));
  }

  /**
   * Gets the leftmost X coordinate of a subtree.
   */
  private getSubtreeLeftX(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.x;
    }
    return Math.min(...node.children.map((child) => this.getSubtreeLeftX(child)));
  }

  /**
   * Adjusts the position of a subtree by applying X offset.
   */
  private adjustSubtreePosition(node: D3HierarchyNode, xOffset: number): void {
    node.x += xOffset;
    if (node.children) {
      node.children.forEach((child) => this.adjustSubtreePosition(child, xOffset));
    }
  }

  /**
   * Adjusts horizontal spacing between sibling subtrees.
   */
  private adjustSpacing(node: D3HierarchyNode, horizontalSpacing: number): void {
    if (!node.children || node.children.length <= 1) return;

    const children = node.children;
    const spacingErrors: number[] = [];

    for (let i = 1; i < children.length; i++) {
      const prevRight = this.getSubtreeRightX(children[i - 1]);
      const currentLeft = this.getSubtreeLeftX(children[i]);
      const actualSpacing = currentLeft - prevRight;
      spacingErrors.push(horizontalSpacing - actualSpacing);
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

    children.forEach((child) => this.adjustSpacing(child, horizontalSpacing));
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

    // Calculate subtree widths (for horizontal centering)
    hierarchy.eachAfter((node: D3HierarchyNode) => {
      node.subtreeWidth = this.calculateSubtreeWidth(node, horizontalSpacing);
    });

    // Position all nodes
    this.positionHierarchy(hierarchy, rootX, rootY, rootNode, horizontalSpacing, verticalSpacing);

    // Adjust spacing
    this.adjustSpacing(hierarchy, horizontalSpacing);

    // Collect positioned nodes
    const layoutedNodes: MindMapNode[] = [];
    hierarchy.each((node: D3HierarchyNode) => {
      const originalNode = node.data.originalNode;
      if (originalNode) {
        layoutedNodes.push({
          ...originalNode,
          position: { x: node.x, y: node.y },
          data: {
            ...originalNode.data,
            // Use 'right' side for all non-root nodes (meaning 'below' in org chart)
            side: originalNode.type === MINDMAP_TYPES.ROOT_NODE ? SIDE.MID : SIDE.RIGHT,
          },
        });
      }
    });

    return { nodes: layoutedNodes, edges };
  }

  getEdgeHandles(_parentNode: MindMapNode, _childNode: MindMapNode): EdgeHandleInfo {
    // For org chart: parent's bottom handle to child's top handle
    return {
      sourceHandle: 'bottom',
      targetHandle: 'top',
    };
  }

  getDefaultChildSide(_parentNode: MindMapNode, _existingChildren: MindMapNode[]): Side {
    // All children go below (represented as 'right' side)
    return SIDE.RIGHT;
  }
}

/**
 * Singleton instance
 */
export const orgChartLayoutStrategy = new OrgChartLayoutStrategy();
