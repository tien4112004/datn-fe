import type { LayoutType, MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_TYPE, SIDE, MINDMAP_TYPES } from '../../types';

/**
 * Configuration for layout-specific side assignments
 */
interface LayoutSideConfig {
  /** Valid sides for child nodes in this layout */
  validSides: Side[];
  /** Default side for new children */
  defaultSide: Side;
  /** Whether to balance children across sides */
  balanced: boolean;
}

/**
 * Layout side configurations
 */
const LAYOUT_SIDE_CONFIGS: Record<LayoutType, LayoutSideConfig> = {
  [LAYOUT_TYPE.HORIZONTAL_BALANCED]: {
    validSides: [SIDE.LEFT, SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: true,
  },
  [LAYOUT_TYPE.VERTICAL_BALANCED]: {
    validSides: [SIDE.TOP, SIDE.BOTTOM],
    defaultSide: SIDE.BOTTOM,
    balanced: true,
  },
  [LAYOUT_TYPE.RIGHT_ONLY]: {
    validSides: [SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: false,
  },
  [LAYOUT_TYPE.LEFT_ONLY]: {
    validSides: [SIDE.LEFT],
    defaultSide: SIDE.LEFT,
    balanced: false,
  },
  [LAYOUT_TYPE.BOTTOM_ONLY]: {
    validSides: [SIDE.BOTTOM],
    defaultSide: SIDE.BOTTOM,
    balanced: false,
  },
  [LAYOUT_TYPE.TOP_ONLY]: {
    validSides: [SIDE.TOP],
    defaultSide: SIDE.TOP,
    balanced: false,
  },
  [LAYOUT_TYPE.NONE]: {
    validSides: [SIDE.LEFT, SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: false,
  },
};

/**
 * Maps side to the opposite side (for target handles)
 */
const OPPOSITE_SIDE: Record<Side, Side> = {
  [SIDE.LEFT]: SIDE.RIGHT,
  [SIDE.RIGHT]: SIDE.LEFT,
  [SIDE.TOP]: SIDE.BOTTOM,
  [SIDE.BOTTOM]: SIDE.TOP,
  [SIDE.MID]: SIDE.MID,
};

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Gets the layout side configuration for a given layout type.
 */
export const getLayoutConfig = (layoutType: LayoutType): LayoutSideConfig =>
  LAYOUT_SIDE_CONFIGS[layoutType] || LAYOUT_SIDE_CONFIGS[LAYOUT_TYPE.HORIZONTAL_BALANCED];

/**
 * Gets the opposite side for edge target handles.
 */
export const getOppositeSide = (side: Side): Side => OPPOSITE_SIDE[side];

/**
 * Checks if a side is valid for a given layout type.
 */
export const isValidSide = (side: Side, layoutType: LayoutType): boolean => {
  const config = getLayoutConfig(layoutType);
  return config.validSides.includes(side);
};

/**
 * Recursively propagates the subtree direction to all descendants.
 */
const propagateSubtreeDirection = (
  nodeId: string,
  side: Side,
  childrenByParent: Map<string, MindMapNode[]>,
  subtreeDirection: Map<string, Side>
): void => {
  const children = childrenByParent.get(nodeId) || [];
  for (const child of children) {
    subtreeDirection.set(child.id, side);
    propagateSubtreeDirection(child.id, side, childrenByParent, subtreeDirection);
  }
};

/**
 * Assigns sides to nodes based on the target layout type.
 * For balanced layouts, distributes root's direct children evenly,
 * then propagates the subtree direction to all descendants.
 * For single-direction layouts, assigns all to the same side.
 */
export const assignSides = (nodes: MindMapNode[], layoutType: LayoutType): MindMapNode[] => {
  const config = getLayoutConfig(layoutType);

  // Build node lookup and children map
  const nodeMap = new Map<string, MindMapNode>();
  const childrenByParent = new Map<string, MindMapNode[]>();
  const rootNodes: MindMapNode[] = [];

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      rootNodes.push(node);
    } else if (node.data.parentId) {
      const children = childrenByParent.get(node.data.parentId) || [];
      children.push(node);
      childrenByParent.set(node.data.parentId, children);
    }
  }

  // For balanced layouts, we need to propagate subtree direction
  if (config.balanced && config.validSides.length >= 2) {
    const subtreeDirection = new Map<string, Side>();

    for (const root of rootNodes) {
      subtreeDirection.set(root.id, SIDE.MID);

      const directChildren = childrenByParent.get(root.id) || [];
      const sortedChildren = [...directChildren].sort((a, b) => {
        const orderA = a.data.siblingOrder ?? 0;
        const orderB = b.data.siblingOrder ?? 0;
        return orderA - orderB;
      });

      sortedChildren.forEach((child, index) => {
        const sideIndex = index % config.validSides.length;
        const side = config.validSides[sideIndex];
        subtreeDirection.set(child.id, side);
        propagateSubtreeDirection(child.id, side, childrenByParent, subtreeDirection);
      });
    }

    return nodes.map((node) => {
      if (node.type === MINDMAP_TYPES.ROOT_NODE) {
        return { ...node, data: { ...node.data, side: SIDE.MID } };
      }
      const side = subtreeDirection.get(node.id) ?? config.defaultSide;
      return { ...node, data: { ...node.data, side } };
    });
  }

  // For single-direction layouts, assign all to the same side
  return nodes.map((node) => {
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      return { ...node, data: { ...node.data, side: SIDE.MID } };
    }
    return { ...node, data: { ...node.data, side: config.defaultSide } };
  });
};

/**
 * Updates edge handles based on node side assignments.
 * Uses the standardized format: {side}-source-{id} and {side}-target-{id}
 */
export const updateEdgeHandles = (
  edges: MindMapEdge[],
  nodes: MindMapNode[],
  _layoutType: LayoutType
): MindMapEdge[] => {
  const nodeMap = new Map<string, MindMapNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return edge;
    }

    const childSide = targetNode.data.side;
    const sourceHandle = `${childSide}-source-${sourceNode.id}`;
    const targetHandle = `${getOppositeSide(childSide)}-target-${targetNode.id}`;

    return { ...edge, sourceHandle, targetHandle };
  });
};

/**
 * Prepares nodes and edges for a layout transition.
 */
export const prepareTransition = (
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  _fromLayout: LayoutType,
  toLayout: LayoutType
): { nodes: MindMapNode[]; edges: MindMapEdge[] } => {
  const nodesWithSides = assignSides(nodes, toLayout);
  const updatedEdges = updateEdgeHandles(edges, nodesWithSides, toLayout);
  return { nodes: nodesWithSides, edges: updatedEdges };
};

/**
 * Gets the default child side for a given layout type.
 */
export const getDefaultChildSide = (layoutType: LayoutType): Side => getLayoutConfig(layoutType).defaultSide;

/**
 * Calculates the next side for a new child in a balanced layout.
 */
export const getNextChildSide = (existingChildren: MindMapNode[], layoutType: LayoutType): Side => {
  const config = getLayoutConfig(layoutType);

  if (!config.balanced || config.validSides.length < 2) {
    return config.defaultSide;
  }

  const sideCounts: Record<string, number> = {};
  for (const side of config.validSides) {
    sideCounts[side] = 0;
  }

  for (const child of existingChildren) {
    const side = child.data.side;
    if (side in sideCounts) {
      sideCounts[side]++;
    }
  }

  let minCount = Infinity;
  let minSide = config.defaultSide;

  for (const side of config.validSides) {
    if (sideCounts[side] < minCount) {
      minCount = sideCounts[side];
      minSide = side;
    }
  }

  return minSide;
};

// ============================================================================
// Backwards Compatibility - Service Object
// ============================================================================

/**
 * Service object for backwards compatibility.
 * Wraps the pure functions in an object interface.
 */
export const layoutTransitionService = {
  getLayoutConfig,
  getOppositeSide,
  isValidSide,
  assignSides,
  updateEdgeHandles,
  prepareTransition,
  getDefaultChildSide,
  getNextChildSide,
};
