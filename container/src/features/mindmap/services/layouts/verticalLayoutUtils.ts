import type { MindMapNode, MindMapEdge, Side } from '../../types';
import type { LayoutResult, LayoutOptions, EdgeHandleInfo } from '../../types';
import { MINDMAP_TYPES, SIDE } from '../../types';
import * as d3 from 'd3';
import {
  type HierarchyNode,
  type D3HierarchyNode,
  groupByParent,
  buildSubtree,
  preprocessHierarchy,
  sortBySiblingOrder,
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

/**
 * Assigns side and siblingOrder to nodes based on their final positions.
 * For vertical layouts:
 * - side: TOP if y < rootY, BOTTOM otherwise
 * - siblingOrder: based on X position within each parent group (left to right)
 */
const assignSideAndOrderFromPositionsVertical = (nodes: MindMapNode[], rootY: number): MindMapNode[] => {
  // Group nodes by parentId
  const childrenByParent = new Map<string, MindMapNode[]>();
  for (const node of nodes) {
    if (node.type === MINDMAP_TYPES.ROOT_NODE) continue;
    const parentId = node.data.parentId;
    if (!parentId) continue;

    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, []);
    }
    childrenByParent.get(parentId)!.push(node);
  }

  // For each parent group, sort by X position and assign siblingOrder
  const orderMap = new Map<string, number>();
  for (const [_parentId, children] of childrenByParent) {
    // Sort by X position (left to right)
    const sorted = [...children].sort((a, b) => {
      const xA = a.position?.x ?? 0;
      const xB = b.position?.x ?? 0;
      return xA - xB;
    });

    sorted.forEach((child, index) => {
      orderMap.set(child.id, index);
    });
  }

  // Apply side and siblingOrder to all nodes
  return nodes.map((node) => {
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      return {
        ...node,
        data: { ...node.data, side: SIDE.MID as Side },
      };
    }

    const nodeY = node.position?.y ?? 0;
    const side = nodeY < rootY ? SIDE.TOP : SIDE.BOTTOM;
    const siblingOrder = orderMap.get(node.id) ?? node.data.siblingOrder ?? 0;

    return {
      ...node,
      data: { ...node.data, side, siblingOrder },
    };
  });
};

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

// ============================================================================
// Balanced Vertical Layout
// ============================================================================

/**
 * Builds a hierarchy for a subset of level 1 nodes (used for balanced layout).
 * This version takes specific level1 nodes instead of filtering by side.
 */
const buildVerticalSideHierarchyFromNodes = (
  rootNode: MindMapNode,
  level1Nodes: MindMapNode[],
  childrenMap: Map<string, MindMapNode[]>
): HierarchyNode => {
  const children = level1Nodes.map((child) => buildSubtree(child, childrenMap));

  return {
    originalNode: rootNode,
    children,
  };
};

/**
 * Processes a side hierarchy and positions nodes for vertical layout.
 * Assigns side based on final position relative to root.
 */
const processBalancedVerticalSideHierarchy = (
  tree: HierarchyNode,
  side: Side,
  rootNode: MindMapNode,
  rootX: number,
  rootY: number,
  horizontalSpacing: number,
  verticalSpacing: number
): MindMapNode[] => {
  if (!tree.children || tree.children.length === 0) {
    return [];
  }

  const hierarchy = d3.hierarchy<HierarchyNode>(tree) as D3HierarchyNode;
  preprocessHierarchy(hierarchy);

  // Calculate subtree widths
  hierarchy.eachAfter((node: D3HierarchyNode) => {
    node.subtreeWidth = calculateSubtreeWidth(node, horizontalSpacing);
  });

  const yDirection = side === SIDE.TOP ? -1 : 1;

  // Position all nodes
  positionVerticalHierarchy(
    hierarchy,
    rootX,
    rootY,
    rootNode,
    horizontalSpacing,
    verticalSpacing,
    yDirection
  );

  // Adjust spacing
  adjustHorizontalSpacing(hierarchy, horizontalSpacing);

  // Collect positioned nodes (side and siblingOrder will be assigned later)
  const layoutedNodes: MindMapNode[] = [];

  hierarchy.each((node: D3HierarchyNode) => {
    const originalNode = node.data.originalNode;
    if (originalNode && originalNode.id !== rootNode.id) {
      layoutedNodes.push({
        ...originalNode,
        position: { x: node.x, y: node.y },
      });
    }
  });

  return layoutedNodes;
};

/**
 * Calculates a balanced vertical layout with nodes on both TOP and BOTTOM sides.
 * Splits level 1 children incrementally: first half to TOP, second half to BOTTOM.
 * Side is assigned AFTER layout based on final positions.
 */
export const calculateBalancedVerticalLayout = (
  rootNode: MindMapNode,
  descendants: MindMapNode[],
  edges: MindMapEdge[],
  options: { horizontalSpacing: number; verticalSpacing: number }
): LayoutResult => {
  const { horizontalSpacing, verticalSpacing } = options;
  const rootX = rootNode.position?.x ?? 0;
  const rootY = rootNode.position?.y ?? 0;

  // Build children map (sorted by siblingOrder)
  const childrenMap = groupByParent(descendants);

  // Get level 1 nodes (direct children of root) sorted by sibling order
  const level1Nodes = sortBySiblingOrder(descendants.filter((n) => n.data.level === 1));

  // Split level 1 nodes incrementally: first half to TOP, second half to BOTTOM
  const totalLevel1 = level1Nodes.length;
  const halfPoint = Math.ceil(totalLevel1 / 2);
  const topLevel1Nodes = level1Nodes.slice(0, halfPoint);
  const bottomLevel1Nodes = level1Nodes.slice(halfPoint);

  // Build and process top side
  const topTree = buildVerticalSideHierarchyFromNodes(rootNode, topLevel1Nodes, childrenMap);
  const topNodes = processBalancedVerticalSideHierarchy(
    topTree,
    SIDE.TOP,
    rootNode,
    rootX,
    rootY,
    horizontalSpacing,
    verticalSpacing
  );

  // Build and process bottom side
  const bottomTree = buildVerticalSideHierarchyFromNodes(rootNode, bottomLevel1Nodes, childrenMap);
  const bottomNodes = processBalancedVerticalSideHierarchy(
    bottomTree,
    SIDE.BOTTOM,
    rootNode,
    rootX,
    rootY,
    horizontalSpacing,
    verticalSpacing
  );

  // Combine positioned nodes (root + top + bottom)
  const positionedNodes: MindMapNode[] = [
    {
      ...rootNode,
      position: { x: rootX, y: rootY },
    },
    ...topNodes,
    ...bottomNodes,
  ];

  // Derive side and siblingOrder from final positions
  const layoutedNodes = assignSideAndOrderFromPositionsVertical(positionedNodes, rootY);

  return { nodes: layoutedNodes, edges };
};
