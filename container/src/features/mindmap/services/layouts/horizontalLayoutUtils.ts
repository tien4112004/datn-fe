import type { MindMapNode, MindMapEdge, Side } from '../../types';
import type { LayoutResult, LayoutOptions, EdgeHandleInfo } from '../../types';
import { MINDMAP_TYPES, SIDE } from '../../types';
import * as d3 from 'd3';

// ============================================================================
// Types (internal, re-exported from BaseLayoutStrategy for external use)
// ============================================================================

export interface HierarchyNode {
  originalNode: MindMapNode;
  children?: HierarchyNode[];
}

export type D3HierarchyNode = d3.HierarchyNode<HierarchyNode> & {
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight?: number;
  subtreeWidth?: number;
  children?: D3HierarchyNode[];
  parent?: D3HierarchyNode | null;
};

export interface HorizontalLayoutConfig {
  childSide: Side;
  sourceHandle: 'left' | 'right';
  targetHandle: 'left' | 'right';
  xDirection: 1 | -1;
}

// ============================================================================
// Pure Helper Functions
// ============================================================================

export const sortBySiblingOrder = (nodes: MindMapNode[]): MindMapNode[] =>
  [...nodes].sort((a, b) => {
    const orderA = a.data.siblingOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.siblingOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

export const groupByParent = (nodes: MindMapNode[]): Map<string, MindMapNode[]> => {
  const groups = new Map<string, MindMapNode[]>();

  for (const node of nodes) {
    const parentId = node.data.parentId;
    if (!parentId) continue;

    if (!groups.has(parentId)) {
      groups.set(parentId, []);
    }
    groups.get(parentId)!.push(node);
  }

  for (const [parentId, children] of groups) {
    groups.set(parentId, sortBySiblingOrder(children));
  }

  return groups;
};

export const buildSubtree = (
  startNode: MindMapNode,
  childrenMap: Map<string, MindMapNode[]>
): HierarchyNode => {
  const children = childrenMap.get(startNode.id) || [];
  return {
    originalNode: startNode,
    children: children.map((child) => buildSubtree(child, childrenMap)),
  };
};

export const preprocessHierarchy = (hierarchy: D3HierarchyNode): void => {
  hierarchy.eachBefore((node: D3HierarchyNode) => {
    node.width = node.data.originalNode.measured?.width ?? 0;
    node.height = node.data.originalNode.measured?.height ?? 0;
  });
};

/**
 * Assigns side and siblingOrder to nodes based on their final positions.
 * For horizontal layouts:
 * - side: LEFT if x < rootX, RIGHT otherwise
 * - siblingOrder: based on Y position within each parent group (top to bottom)
 */
export const assignSideAndOrderFromPositions = (nodes: MindMapNode[], rootX: number): MindMapNode[] => {
  // Build a map for quick position lookup
  const nodeMap = new Map<string, MindMapNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

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

  // For each parent group, sort by Y position and assign siblingOrder
  const orderMap = new Map<string, number>();
  for (const [_parentId, children] of childrenByParent) {
    // Sort by Y position (top to bottom)
    const sorted = [...children].sort((a, b) => {
      const yA = a.position?.y ?? 0;
      const yB = b.position?.y ?? 0;
      return yA - yB;
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

    const nodeX = node.position?.x ?? 0;
    const side = nodeX < rootX ? SIDE.LEFT : SIDE.RIGHT;
    const siblingOrder = orderMap.get(node.id) ?? node.data.siblingOrder ?? 0;

    return {
      ...node,
      data: { ...node.data, side, siblingOrder },
    };
  });
};

// ============================================================================
// Horizontal Layout Functions
// ============================================================================

const calculateSubtreeHeight = (node: D3HierarchyNode, verticalSpacing: number): number => {
  if (node.subtreeHeight !== undefined) {
    return node.subtreeHeight;
  }

  const nodeHeight = node.height;

  if (!node.children || node.children.length === 0) {
    node.subtreeHeight = nodeHeight;
    return nodeHeight;
  }

  const childrenHeights = node.children.map((child) => calculateSubtreeHeight(child, verticalSpacing));
  const totalChildrenHeight = childrenHeights.reduce((sum, height) => sum + height, 0);
  const spacingHeight = (node.children.length - 1) * verticalSpacing;

  node.subtreeHeight = Math.max(nodeHeight, totalChildrenHeight + spacingHeight);
  return node.subtreeHeight;
};

const positionHorizontalHierarchy = (
  hierarchy: D3HierarchyNode,
  rootX: number,
  rootY: number,
  rootNode: MindMapNode,
  horizontalSpacing: number,
  verticalSpacing: number,
  xDirection: 1 | -1
): void => {
  hierarchy.descendants().forEach((node: D3HierarchyNode) => {
    const originalNode = node.data.originalNode;
    if (!originalNode) return;

    if (originalNode.id === rootNode.id) {
      node.x = rootX;
      node.y = rootY;
    } else if (node.parent) {
      // Position horizontally relative to parent based on direction
      if (xDirection === 1) {
        node.x = node.parent.x + node.parent.width + horizontalSpacing;
      } else {
        node.x = node.parent.x - node.width - horizontalSpacing;
      }

      // Position vertically among siblings
      if (node.parent.children) {
        const siblings = node.parent.children;
        const siblingIndex = siblings.indexOf(node);

        let cumulativeOffset = 0;
        for (let i = 0; i < siblingIndex; i++) {
          cumulativeOffset += (siblings[i].subtreeHeight || 0) + verticalSpacing;
        }

        const totalSubtreesHeight = siblings.reduce((sum, sibling) => sum + (sibling.subtreeHeight || 0), 0);
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
};

const getSubtreeBottomY = (node: D3HierarchyNode): number => {
  if (!node.children || node.children.length === 0) {
    return node.y + node.height;
  }
  return Math.max(...node.children.map((child) => getSubtreeBottomY(child)));
};

const getSubtreeTopY = (node: D3HierarchyNode): number => {
  if (!node.children || node.children.length === 0) {
    return node.y;
  }
  return Math.min(...node.children.map((child) => getSubtreeTopY(child)));
};

const adjustSubtreePositionY = (node: D3HierarchyNode, yOffset: number): void => {
  node.y += yOffset;
  if (node.children) {
    node.children.forEach((child) => adjustSubtreePositionY(child, yOffset));
  }
};

const adjustVerticalSpacing = (node: D3HierarchyNode, verticalSpacing: number): void => {
  if (!node.children || node.children.length <= 1) return;

  const children = node.children;
  const spacingErrors: number[] = [];

  for (let i = 1; i < children.length; i++) {
    const prevBottom = getSubtreeBottomY(children[i - 1]);
    const currentTop = getSubtreeTopY(children[i]);
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
      adjustSubtreePositionY(child, cumulativeAdjustment);
    });
  }

  children.forEach((child) => adjustVerticalSpacing(child, verticalSpacing));
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

export const calculateHorizontalLayout = async (
  rootNode: MindMapNode,
  descendants: MindMapNode[],
  edges: MindMapEdge[],
  options: LayoutOptions,
  config: HorizontalLayoutConfig
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

  // Calculate subtree heights
  hierarchy.eachAfter((node: D3HierarchyNode) => {
    node.subtreeHeight = calculateSubtreeHeight(node, verticalSpacing);
  });

  // Position all nodes
  positionHorizontalHierarchy(
    hierarchy,
    rootX,
    rootY,
    rootNode,
    horizontalSpacing,
    verticalSpacing,
    config.xDirection
  );

  // Adjust spacing
  adjustVerticalSpacing(hierarchy, verticalSpacing);

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
// Balanced Horizontal Layout
// ============================================================================

/**
 * Builds a hierarchy for a subset of level 1 nodes (used for balanced layout).
 * This version takes specific level1 nodes instead of filtering by side.
 */
const buildSideHierarchyFromNodes = (
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
 * Processes a side hierarchy and positions nodes, assigning side based on final position.
 */
const processBalancedSideHierarchy = (
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

  // Calculate subtree heights
  hierarchy.eachAfter((node: D3HierarchyNode) => {
    node.subtreeHeight = calculateSubtreeHeight(node, verticalSpacing);
  });

  const xDirection = side === SIDE.LEFT ? -1 : 1;

  // Position all nodes
  positionHorizontalHierarchy(
    hierarchy,
    rootX,
    rootY,
    rootNode,
    horizontalSpacing,
    verticalSpacing,
    xDirection
  );

  // Adjust spacing
  adjustVerticalSpacing(hierarchy, verticalSpacing);

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
 * Calculates a balanced horizontal layout with nodes on both LEFT and RIGHT sides.
 * Splits level 1 children incrementally: first half to LEFT, second half to RIGHT.
 * Side is assigned AFTER layout based on final positions.
 */
export const calculateBalancedHorizontalLayout = (
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

  // Split level 1 nodes incrementally: first half to LEFT, second half to RIGHT
  const totalLevel1 = level1Nodes.length;
  const halfPoint = Math.ceil(totalLevel1 / 2);
  const leftLevel1Nodes = level1Nodes.slice(0, halfPoint);
  const rightLevel1Nodes = level1Nodes.slice(halfPoint);

  // Build and process left side
  const leftTree = buildSideHierarchyFromNodes(rootNode, leftLevel1Nodes, childrenMap);
  const leftNodes = processBalancedSideHierarchy(
    leftTree,
    SIDE.LEFT,
    rootNode,
    rootX,
    rootY,
    horizontalSpacing,
    verticalSpacing
  );

  // Build and process right side
  const rightTree = buildSideHierarchyFromNodes(rootNode, rightLevel1Nodes, childrenMap);
  const rightNodes = processBalancedSideHierarchy(
    rightTree,
    SIDE.RIGHT,
    rootNode,
    rootX,
    rootY,
    horizontalSpacing,
    verticalSpacing
  );

  // Combine positioned nodes (root + left + right)
  const positionedNodes: MindMapNode[] = [
    {
      ...rootNode,
      position: { x: rootX, y: rootY },
    },
    ...leftNodes,
    ...rightNodes,
  ];

  // Derive side and siblingOrder from final positions
  const layoutedNodes = assignSideAndOrderFromPositions(positionedNodes, rootX);

  return { nodes: layoutedNodes, edges };
};
