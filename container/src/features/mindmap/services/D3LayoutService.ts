import type { Direction } from '../types/constants';
import { MINDMAP_TYPES, type MindMapEdge, type MindMapNode } from '../types';
import * as d3 from 'd3';

interface HierarchyNode {
  originalNode: MindMapNode;
  children?: HierarchyNode[];
}

class D3LayoutService {
  calculateSubtreeHeight(node: any, verticalSpacing: number): number {
    if (node.subtreeHeight !== undefined) {
      return node.subtreeHeight;
    }

    const nodeHeight = node.data.originalNode.measured?.height ?? 0;

    if (!node.children || node.children.length === 0) {
      node.subtreeHeight = nodeHeight;
      return nodeHeight;
    }

    const childrenHeights = node.children.map((child: any) =>
      this.calculateSubtreeHeight(child, verticalSpacing)
    );
    const totalChildrenHeight = childrenHeights.reduce((sum: number, height: number) => sum + height, 0);
    const spacingHeight = (node.children.length - 1) * verticalSpacing;

    node.subtreeHeight = Math.max(nodeHeight, totalChildrenHeight + spacingHeight);

    return node.subtreeHeight;
  }

  positionHierarchy(
    hierarchy: any,
    side: 'left' | 'right',
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    horizontalSpacing: number,
    verticalSpacing: number,
    direction: Direction
  ) {
    hierarchy.descendants().forEach((node: any) => {
      const originalNode = node.data.originalNode;
      if (!originalNode) return;

      if (originalNode.id === rootNode.id) {
        node.x = rootX;
        node.y = rootY;
      } else {
        // Position based on direction and side
        if (direction === 'horizontal') {
          // Horizontal layout: extend left/right from parent
          if (side === 'left') {
            node.x = node.parent.x - horizontalSpacing - (originalNode.measured?.width ?? 0);
          } else {
            node.x = node.parent.x + horizontalSpacing + (node.parent.data.originalNode.measured?.width ?? 0);
          }
        } else if (direction === 'vertical') {
          // Vertical layout: extend top/bottom from parent
          if (side === 'left') {
            // In vertical layout, 'left' side goes up
            node.y = node.parent.y - verticalSpacing - (originalNode.measured?.height ?? 0);
          } else {
            // In vertical layout, 'right' side goes down
            node.y = node.parent.y + verticalSpacing + (node.parent.data.originalNode.measured?.height ?? 0);
          }
        }

        if (node.parent?.children) {
          const siblings = node.parent.children;
          const siblingIndex = siblings.indexOf(node);

          let cumulativeOffset = 0;
          for (let i = 0; i < siblingIndex; i++) {
            cumulativeOffset += siblings[i].subtreeHeight + verticalSpacing;
          }

          const totalSubtreesHeight = siblings.reduce(
            (sum: number, sibling: any) => sum + sibling.subtreeHeight,
            0
          );
          const totalSpacing = (siblings.length - 1) * verticalSpacing;
          const totalLayoutHeight = totalSubtreesHeight + totalSpacing;

          if (direction === 'horizontal') {
            // Horizontal direction - position siblings vertically
            if (siblings.length === 1) {
              node.y =
                node.parent.y +
                node.parent.data.originalNode.measured?.height / 2 -
                originalNode.measured?.height / 2;
            } else {
              node.y = node.parent.y - totalLayoutHeight / 2 + cumulativeOffset;
            }
          } else if (direction === 'vertical') {
            // Vertical direction - position siblings horizontally
            if (siblings.length === 1) {
              node.x =
                node.parent.x +
                node.parent.data.originalNode.measured?.width / 2 -
                originalNode.measured?.width / 2;
            } else {
              // For vertical directions, we need to calculate width-based spacing
              const totalSubtreesWidth = siblings.reduce(
                (sum: number, sibling: any) => sum + (sibling.data.originalNode.measured?.width ?? 0),
                0
              );
              const totalWidthSpacing = (siblings.length - 1) * horizontalSpacing;
              const totalLayoutWidth = totalSubtreesWidth + totalWidthSpacing;

              let widthCumulativeOffset = 0;
              for (let i = 0; i < siblingIndex; i++) {
                widthCumulativeOffset +=
                  (siblings[i].data.originalNode.measured?.width ?? 0) + horizontalSpacing;
              }

              node.x = node.parent.x - totalLayoutWidth / 2 + widthCumulativeOffset;
            }
          }
        }
      }
    });
  }

  getSubtreeBottomY(node: any): number {
    if (!node.children || node.children.length === 0) {
      return node.y + (node.data.originalNode.measured?.height ?? 0);
    }

    return Math.max(...node.children.map((child: any) => this.getSubtreeBottomY(child)));
  }

  getSubtreeTopY(node: any): number {
    if (!node.children || node.children.length === 0) {
      return node.y;
    }

    return Math.min(...node.children.map((child: any) => this.getSubtreeTopY(child)));
  }

  getSubtreeRightX(node: any): number {
    if (!node.children || node.children.length === 0) {
      return node.x + (node.data.originalNode.measured?.width ?? 0);
    }

    return Math.max(...node.children.map((child: any) => this.getSubtreeRightX(child)));
  }

  getSubtreeLeftX(node: any): number {
    if (!node.children || node.children.length === 0) {
      return node.x;
    }

    return Math.min(...node.children.map((child: any) => this.getSubtreeLeftX(child)));
  }

  adjustSubtreePosition(node: any, yOffset: number, xOffset: number = 0) {
    node.y += yOffset;
    node.x += xOffset;
    if (node.children) {
      node.children.forEach((child: any) => this.adjustSubtreePosition(child, yOffset, xOffset));
    }
  }

  adjustSpacing(node: any, direction: Direction, spacing: number) {
    if (!node.children || node.children.length <= 1) return;

    const children = node.children;
    const spacingErrors: number[] = [];

    if (direction === 'horizontal') {
      // For horizontal directions, adjust vertical spacing between siblings
      for (let i = 1; i < children.length; i++) {
        const prevBottom = this.getSubtreeBottomY(children[i - 1]);
        const currentTop = this.getSubtreeTopY(children[i]);
        const actualSpacing = currentTop - prevBottom;
        spacingErrors.push(spacing - actualSpacing);
      }

      if (spacingErrors.some((error) => Math.abs(error) > 0.1)) {
        const totalError = spacingErrors.reduce((sum, error) => sum + error, 0);
        const averageAdjustment = totalError / children.length;

        let cumulativeAdjustment = -averageAdjustment;

        children.forEach((child: any, index: number) => {
          if (index > 0) {
            cumulativeAdjustment += spacingErrors[index - 1];
          }

          this.adjustSubtreePosition(child, cumulativeAdjustment, 0);
        });
      }
    } else if (direction === 'vertical') {
      // For vertical directions, adjust horizontal spacing between siblings
      for (let i = 1; i < children.length; i++) {
        const prevRight = this.getSubtreeRightX(children[i - 1]);
        const currentLeft = this.getSubtreeLeftX(children[i]);
        const actualSpacing = currentLeft - prevRight;
        spacingErrors.push(spacing - actualSpacing);
      }

      if (spacingErrors.some((error) => Math.abs(error) > 0.1)) {
        const totalError = spacingErrors.reduce((sum, error) => sum + error, 0);
        const averageAdjustment = totalError / children.length;

        let cumulativeAdjustment = -averageAdjustment;

        children.forEach((child: any, index: number) => {
          if (index > 0) {
            cumulativeAdjustment += spacingErrors[index - 1];
          }

          this.adjustSubtreePosition(child, 0, cumulativeAdjustment);
        });
      }
    }

    children.forEach((child: any) => this.adjustSpacing(child, direction, spacing));
  }

  buildSubtree(startNode: MindMapNode, childrenMap: Map<string, MindMapNode[]>): any {
    const children = childrenMap.get(startNode.id) || [];
    return {
      originalNode: startNode,
      children: children.map((child) => this.buildSubtree(child, childrenMap)),
    };
  }

  createHierarchy(
    side: 'left' | 'right',
    nodes: MindMapNode[],
    rootNode: MindMapNode,
    childrenMap: Map<string, MindMapNode[]>
  ) {
    const level1Nodes = nodes.filter((node) => node.data.level === 1 && node.data.side === side);
    const tree = {
      originalNode: rootNode,
      children: level1Nodes.map((node) => this.buildSubtree(node, childrenMap)),
    };

    const hierarchy = d3.hierarchy<HierarchyNode>(tree);
    const treeLayout = d3.tree<HierarchyNode>().nodeSize([0, 200]);
    treeLayout(hierarchy);

    return hierarchy;
  }

  processHierarchy(
    hierarchy: any,
    side: 'left' | 'right',
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    horizontalSpacing: number,
    verticalSpacing: number,
    layoutedNodes: MindMapNode[],
    direction: Direction
  ) {
    hierarchy.eachAfter((node: any) => {
      node.subtreeHeight = this.calculateSubtreeHeight(node, verticalSpacing);
    });

    this.positionHierarchy(
      hierarchy,
      side,
      rootX,
      rootY,
      rootNode,
      horizontalSpacing,
      verticalSpacing,
      direction
    );

    // Use appropriate spacing based on layout direction
    const spacing = direction === 'horizontal' ? verticalSpacing : horizontalSpacing;
    this.adjustSpacing(hierarchy, direction, spacing);

    hierarchy.each((node: any) => {
      const originalNode = node.data.originalNode;
      if (originalNode && originalNode.id !== rootNode.id) {
        layoutedNodes.push({
          ...originalNode,
          position: {
            x: node.x,
            y: node.y,
          },
        });
      }
    });
  }

  async getLayoutedElements(nodes: MindMapNode[], edges: MindMapEdge[], direction: Direction) {
    const rootNode = nodes.find((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

    if (!rootNode) {
      console.warn('No root node found with level 0');
      return { nodes, edges };
    }

    const nodeMap = new Map<string, MindMapNode>();
    const childrenMap = new Map<string, MindMapNode[]>();

    const rootX = rootNode.position?.x ?? 0;
    const rootY = rootNode.position?.y ?? 0;
    const layoutedNodes: MindMapNode[] = [];

    // Position root node at its original position
    layoutedNodes.push({
      ...rootNode,
      position: { x: rootX, y: rootY },
    });

    // Build maps with cycle detection
    for (const node of nodes) {
      nodeMap.set(node.id, node);

      if (node.data.parentId) {
        if (!childrenMap.has(node.data.parentId)) {
          childrenMap.set(node.data.parentId, []);
        }
        childrenMap.get(node.data.parentId)!.push(node);
      }
    }

    // Create hierarchies for left and right sides only
    const leftHierarchy = this.createHierarchy('left', nodes, rootNode, childrenMap);
    const rightHierarchy = this.createHierarchy('right', nodes, rootNode, childrenMap);

    const HORIZONTAL_SPACING = 200;
    const VERTICAL_SPACING = 80;

    // Process both hierarchies with the given direction
    this.processHierarchy(
      leftHierarchy,
      'left',
      rootX,
      rootY,
      rootNode,
      HORIZONTAL_SPACING,
      VERTICAL_SPACING,
      layoutedNodes,
      direction
    );
    this.processHierarchy(
      rightHierarchy,
      'right',
      rootX,
      rootY,
      rootNode,
      HORIZONTAL_SPACING,
      VERTICAL_SPACING,
      layoutedNodes,
      direction
    );

    return { nodes: layoutedNodes, edges };
  }
}

export const d3LayoutService = new D3LayoutService();
