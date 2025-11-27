import type { MindMapNode, MindMapEdge, Side } from '../../types';
import type { LayoutResult, LayoutOptions, EdgeHandleInfo } from '../../types';
import { MINDMAP_TYPES } from '../../types';
import * as d3 from 'd3';
import {
  type HierarchyNode,
  type D3HierarchyNode,
  groupByParent,
  buildSubtree,
  preprocessHierarchy,
} from './horizontalLayoutUtils';

// ============================================================================
// Types
// ============================================================================

export interface VerticalLayoutConfig {
  childSide: Side;
  sourceHandle: 'top' | 'bottom';
  targetHandle: 'top' | 'bottom';
  yDirection: 1 | -1;
}

// ============================================================================
// Vertical Layout Functions
// ============================================================================

const calculateSubtreeWidth = (node: D3HierarchyNode, horizontalSpacing: number): number => {
  if (node.subtreeWidth !== undefined) {
    return node.subtreeWidth;
  }

  const nodeWidth = node.width;

  if (!node.children || node.children.length === 0) {
    node.subtreeWidth = nodeWidth;
    return nodeWidth;
  }

  const childrenWidths = node.children.map((child) => calculateSubtreeWidth(child, horizontalSpacing));
  const totalChildrenWidth = childrenWidths.reduce((sum, width) => sum + width, 0);
  const spacingWidth = (node.children.length - 1) * horizontalSpacing;

  node.subtreeWidth = Math.max(nodeWidth, totalChildrenWidth + spacingWidth);
  return node.subtreeWidth;
};

const alignSiblingsByBottomEdge = (node: D3HierarchyNode): void => {
  if (!node.children || node.children.length === 0) return;

  const siblings = node.children;
  const maxBottomY = Math.max(...siblings.map((child) => child.y + child.height));

  siblings.forEach((child) => {
    child.y = maxBottomY - child.height;
  });

  siblings.forEach((child) => alignSiblingsByBottomEdge(child));
};

const positionVerticalHierarchy = (
  hierarchy: D3HierarchyNode,
  rootX: number,
  rootY: number,
  rootNode: MindMapNode,
  horizontalSpacing: number,
  verticalSpacing: number,
  yDirection: 1 | -1
): void => {
  hierarchy.descendants().forEach((node: D3HierarchyNode) => {
    const originalNode = node.data.originalNode;
    if (!originalNode) return;

    if (originalNode.id === rootNode.id) {
      node.x = rootX;
      node.y = rootY;
    } else if (node.parent) {
      // Position vertically relative to parent based on direction
      if (yDirection === 1) {
        node.y = node.parent.y + node.parent.height + verticalSpacing;
      } else {
        node.y = node.parent.y - node.height - verticalSpacing;
      }

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
          node.x = node.parent.x + node.parent.width / 2 - node.width / 2;
        } else {
          const parentCenterX = node.parent.x + node.parent.width / 2;
          const layoutStartX = parentCenterX - totalLayoutWidth / 2;
          const subtreeOffset = (node.subtreeWidth || node.width) / 2 - node.width / 2;
          node.x = layoutStartX + cumulativeOffset + subtreeOffset;
        }
      }
    }
  });

  // For top layout, align siblings by their bottom edges
  if (yDirection === -1) {
    alignSiblingsByBottomEdge(hierarchy);
  }
};

const getSubtreeRightX = (node: D3HierarchyNode): number => {
  if (!node.children || node.children.length === 0) {
    return node.x + node.width;
  }
  return Math.max(...node.children.map((child) => getSubtreeRightX(child)));
};

const getSubtreeLeftX = (node: D3HierarchyNode): number => {
  if (!node.children || node.children.length === 0) {
    return node.x;
  }
  return Math.min(...node.children.map((child) => getSubtreeLeftX(child)));
};

const adjustSubtreePositionX = (node: D3HierarchyNode, xOffset: number): void => {
  node.x += xOffset;
  if (node.children) {
    node.children.forEach((child) => adjustSubtreePositionX(child, xOffset));
  }
};

const adjustHorizontalSpacing = (node: D3HierarchyNode, horizontalSpacing: number): void => {
  if (!node.children || node.children.length <= 1) return;

  const children = node.children;
  const spacingErrors: number[] = [];

  for (let i = 1; i < children.length; i++) {
    const prevRight = getSubtreeRightX(children[i - 1]);
    const currentLeft = getSubtreeLeftX(children[i]);
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
      adjustSubtreePositionX(child, cumulativeAdjustment);
    });
  }

  children.forEach((child) => adjustHorizontalSpacing(child, horizontalSpacing));
};

const updateEdgeHandles = (
  edges: MindMapEdge[],
  layoutedNodes: MindMapNode[],
  getHandles: (parent: MindMapNode, child: MindMapNode) => EdgeHandleInfo
): MindMapEdge[] => {
  const nodeMap = new Map<string, MindMapNode>();
  for (const node of layoutedNodes) {
    nodeMap.set(node.id, node);
  }

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return edge;
    }

    const handles = getHandles(sourceNode, targetNode);

    return {
      ...edge,
      sourceHandle: `${handles.sourceHandle}-source-${sourceNode.id}`,
      targetHandle: `${handles.targetHandle}-target-${targetNode.id}`,
    };
  });
};

// ============================================================================
// Main Layout Function
// ============================================================================

export const calculateVerticalLayout = async (
  rootNode: MindMapNode,
  descendants: MindMapNode[],
  edges: MindMapEdge[],
  options: LayoutOptions,
  config: VerticalLayoutConfig
): Promise<LayoutResult> => {
  const allNodes = [rootNode, ...descendants];

  if (allNodes.length <= 1) {
    return { nodes: allNodes, edges };
  }

  const { horizontalSpacing, verticalSpacing } = options;
  const rootX = rootNode.position?.x ?? 0;
  const rootY = rootNode.position?.y ?? 0;

  // Build children map (sorted by siblingOrder)
  const childrenMap = groupByParent(descendants);

  // Build hierarchy starting from root
  const tree: HierarchyNode = {
    originalNode: rootNode,
    children: (childrenMap.get(rootNode.id) || []).map((child) => buildSubtree(child, childrenMap)),
  };

  const hierarchy = d3.hierarchy<HierarchyNode>(tree) as D3HierarchyNode;

  // Preprocess to add width/height
  preprocessHierarchy(hierarchy);

  // Calculate subtree widths
  hierarchy.eachAfter((node: D3HierarchyNode) => {
    node.subtreeWidth = calculateSubtreeWidth(node, horizontalSpacing);
  });

  // Position all nodes
  positionVerticalHierarchy(
    hierarchy,
    rootX,
    rootY,
    rootNode,
    horizontalSpacing,
    verticalSpacing,
    config.yDirection
  );

  // Adjust spacing
  adjustHorizontalSpacing(hierarchy, horizontalSpacing);

  // Collect positioned nodes with correct side assignment
  const layoutedNodes: MindMapNode[] = [];

  hierarchy.each((node: D3HierarchyNode) => {
    const originalNode = node.data.originalNode;
    if (originalNode) {
      layoutedNodes.push({
        ...originalNode,
        position: { x: node.x, y: node.y },
        data: {
          ...originalNode.data,
          side: originalNode.type === MINDMAP_TYPES.ROOT_NODE ? 'mid' : config.childSide,
        },
      });
    }
  });

  // Update edge handles for this layout
  const getHandles = () => ({
    sourceHandle: config.sourceHandle,
    targetHandle: config.targetHandle,
  });

  const updatedEdges = updateEdgeHandles(edges, layoutedNodes, getHandles);

  return { nodes: layoutedNodes, edges: updatedEdges };
};
