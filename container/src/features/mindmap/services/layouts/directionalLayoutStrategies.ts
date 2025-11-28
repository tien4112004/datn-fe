import type {
  LayoutStrategy,
  LayoutConfig,
  LayoutResult,
  LayoutOptions,
  EdgeHandleInfo,
  NodePositionInfo,
  SiblingOrderMap,
  LayoutType,
  MindMapNode,
  MindMapEdge,
  Side,
} from '../../types';
import { LAYOUT_CONFIGS, LAYOUT_TYPE, SIDE } from '../../types';
import { siblingOrderService } from './SiblingOrderService';
import { layoutTransitionService } from './LayoutTransitionService';
import {
  calculateHorizontalLayout,
  calculateBalancedHorizontalLayout,
  type HorizontalLayoutConfig,
} from './horizontalLayoutUtils';
import {
  calculateVerticalLayout,
  calculateBalancedVerticalLayout,
  type VerticalLayoutConfig,
} from './verticalLayoutUtils';

// ============================================================================
// Layout Configurations
// ============================================================================

const HORIZONTAL_CONFIGS: Record<string, HorizontalLayoutConfig> = {
  [LAYOUT_TYPE.RIGHT_ONLY]: {
    childSide: SIDE.RIGHT,
    sourceHandle: 'right',
    targetHandle: 'left',
    xDirection: 1,
  },
  [LAYOUT_TYPE.LEFT_ONLY]: {
    childSide: SIDE.LEFT,
    sourceHandle: 'left',
    targetHandle: 'right',
    xDirection: -1,
  },
};

const VERTICAL_CONFIGS: Record<string, VerticalLayoutConfig> = {
  [LAYOUT_TYPE.BOTTOM_ONLY]: {
    childSide: SIDE.BOTTOM,
    sourceHandle: 'bottom',
    targetHandle: 'top',
    yDirection: 1,
  },
  [LAYOUT_TYPE.TOP_ONLY]: {
    childSide: SIDE.TOP,
    sourceHandle: 'top',
    targetHandle: 'bottom',
    yDirection: -1,
  },
};

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a horizontal layout strategy (Left-Only or Right-Only)
 */
export const createHorizontalLayoutStrategy = (type: LayoutType): LayoutStrategy => {
  const layoutConfig = HORIZONTAL_CONFIGS[type];

  if (!layoutConfig) {
    throw new Error(`Unknown horizontal layout type: ${type}`);
  }

  return {
    type,

    get config(): LayoutConfig {
      return LAYOUT_CONFIGS[type];
    },

    calculateLayout: (
      rootNode: MindMapNode,
      descendants: MindMapNode[],
      edges: MindMapEdge[],
      options: LayoutOptions
    ): Promise<LayoutResult> => {
      return calculateHorizontalLayout(rootNode, descendants, edges, options, layoutConfig);
    },

    inferOrderFromPositions: (
      siblings: NodePositionInfo[],
      parentPosition?: { x: number; y: number }
    ): SiblingOrderMap => {
      return siblingOrderService.inferOrderFromPositions(siblings, type, parentPosition);
    },

    getEdgeHandles: (_parentNode: MindMapNode, _childNode: MindMapNode): EdgeHandleInfo => ({
      sourceHandle: layoutConfig.sourceHandle,
      targetHandle: layoutConfig.targetHandle,
    }),

    getDefaultChildSide: (_parentNode: MindMapNode, _existingChildren: MindMapNode[]): Side => {
      return layoutConfig.childSide;
    },
  };
};

/**
 * Creates a vertical layout strategy (Top-Only or Bottom-Only)
 */
export const createVerticalLayoutStrategy = (type: LayoutType): LayoutStrategy => {
  const layoutConfig = VERTICAL_CONFIGS[type];

  if (!layoutConfig) {
    throw new Error(`Unknown vertical layout type: ${type}`);
  }

  return {
    type,

    get config(): LayoutConfig {
      return LAYOUT_CONFIGS[type];
    },

    calculateLayout: (
      rootNode: MindMapNode,
      descendants: MindMapNode[],
      edges: MindMapEdge[],
      options: LayoutOptions
    ): Promise<LayoutResult> => {
      return calculateVerticalLayout(rootNode, descendants, edges, options, layoutConfig);
    },

    inferOrderFromPositions: (
      siblings: NodePositionInfo[],
      parentPosition?: { x: number; y: number }
    ): SiblingOrderMap => {
      return siblingOrderService.inferOrderFromPositions(siblings, type, parentPosition);
    },

    getEdgeHandles: (_parentNode: MindMapNode, _childNode: MindMapNode): EdgeHandleInfo => ({
      sourceHandle: layoutConfig.sourceHandle,
      targetHandle: layoutConfig.targetHandle,
    }),

    getDefaultChildSide: (_parentNode: MindMapNode, _existingChildren: MindMapNode[]): Side => {
      return layoutConfig.childSide;
    },
  };
};

// ============================================================================
// Pre-created Strategy Instances (for backwards compatibility)
// ============================================================================

export const rightOnlyLayoutStrategy = createHorizontalLayoutStrategy(LAYOUT_TYPE.RIGHT_ONLY);
export const leftOnlyLayoutStrategy = createHorizontalLayoutStrategy(LAYOUT_TYPE.LEFT_ONLY);
export const bottomOnlyLayoutStrategy = createVerticalLayoutStrategy(LAYOUT_TYPE.BOTTOM_ONLY);
export const topOnlyLayoutStrategy = createVerticalLayoutStrategy(LAYOUT_TYPE.TOP_ONLY);

// ============================================================================
// Balanced Layout Strategies
// ============================================================================

/**
 * Updates edge handles based on node positions.
 */
const updateEdgeHandles = (
  edges: MindMapEdge[],
  nodes: MindMapNode[],
  getHandles: (parent: MindMapNode, child: MindMapNode) => EdgeHandleInfo
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

    const handles = getHandles(sourceNode, targetNode);

    return {
      ...edge,
      sourceHandle: `${handles.sourceHandle}-source-${sourceNode.id}`,
      targetHandle: `${handles.targetHandle}-target-${targetNode.id}`,
    };
  });
};

/**
 * Horizontal Balanced Layout Strategy
 *
 * Children are distributed on both LEFT and RIGHT sides of the parent.
 * This creates a balanced horizontal tree flowing outward from the center.
 */
export const horizontalBalancedLayoutStrategy: LayoutStrategy = {
  type: LAYOUT_TYPE.HORIZONTAL_BALANCED,

  get config(): LayoutConfig {
    return LAYOUT_CONFIGS[LAYOUT_TYPE.HORIZONTAL_BALANCED];
  },

  calculateLayout: async (
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> => {
    const allNodes = [rootNode, ...descendants];

    if (allNodes.length <= 1) {
      return { nodes: allNodes, edges };
    }

    // Assign sides to nodes using the transition service
    const nodesWithSides = layoutTransitionService.assignSides(allNodes, LAYOUT_TYPE.HORIZONTAL_BALANCED);
    const rootWithSides = nodesWithSides.find((n) => n.id === rootNode.id) || rootNode;
    const descendantsWithSides = nodesWithSides.filter((n) => n.id !== rootNode.id);

    // Use balanced horizontal layout function
    const { nodes: layoutedNodes } = calculateBalancedHorizontalLayout(
      rootWithSides,
      descendantsWithSides,
      edges,
      {
        horizontalSpacing: options.horizontalSpacing ?? 200,
        verticalSpacing: options.verticalSpacing ?? 80,
      }
    );

    // Update edge handles
    const updatedEdges = updateEdgeHandles(
      edges,
      layoutedNodes,
      horizontalBalancedLayoutStrategy.getEdgeHandles
    );

    return { nodes: layoutedNodes, edges: updatedEdges };
  },

  inferOrderFromPositions: (
    siblings: NodePositionInfo[],
    parentPosition?: { x: number; y: number }
  ): SiblingOrderMap => {
    return siblingOrderService.inferOrderFromPositions(
      siblings,
      LAYOUT_TYPE.HORIZONTAL_BALANCED,
      parentPosition
    );
  },

  getEdgeHandles: (_parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo => {
    const childSide = childNode.data.side;

    if (childSide === SIDE.LEFT) {
      return { sourceHandle: 'left', targetHandle: 'right' };
    } else {
      return { sourceHandle: 'right', targetHandle: 'left' };
    }
  },

  getDefaultChildSide: (_parentNode: MindMapNode, existingChildren: MindMapNode[]): Side => {
    return layoutTransitionService.getNextChildSide(existingChildren, LAYOUT_TYPE.HORIZONTAL_BALANCED);
  },
};

/**
 * Vertical Balanced Layout Strategy
 *
 * Children are distributed on both TOP and BOTTOM sides of the parent.
 * This creates a balanced vertical tree flowing outward from the center.
 */
export const verticalBalancedLayoutStrategy: LayoutStrategy = {
  type: LAYOUT_TYPE.VERTICAL_BALANCED,

  get config(): LayoutConfig {
    return LAYOUT_CONFIGS[LAYOUT_TYPE.VERTICAL_BALANCED];
  },

  calculateLayout: async (
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> => {
    const allNodes = [rootNode, ...descendants];

    if (allNodes.length <= 1) {
      return { nodes: allNodes, edges };
    }

    // Assign sides (TOP/BOTTOM) to nodes
    const nodesWithSides = layoutTransitionService.assignSides(allNodes, LAYOUT_TYPE.VERTICAL_BALANCED);
    const rootWithSides = nodesWithSides.find((n) => n.id === rootNode.id) || rootNode;
    const descendantsWithSides = nodesWithSides.filter((n) => n.id !== rootNode.id);

    // Use balanced vertical layout function
    const { nodes: layoutedNodes } = calculateBalancedVerticalLayout(
      rootWithSides,
      descendantsWithSides,
      edges,
      {
        horizontalSpacing: options.horizontalSpacing ?? 200,
        verticalSpacing: options.verticalSpacing ?? 80,
      }
    );

    // Update edge handles
    const updatedEdges = updateEdgeHandles(
      edges,
      layoutedNodes,
      verticalBalancedLayoutStrategy.getEdgeHandles
    );

    return { nodes: layoutedNodes, edges: updatedEdges };
  },

  inferOrderFromPositions: (
    siblings: NodePositionInfo[],
    parentPosition?: { x: number; y: number }
  ): SiblingOrderMap => {
    return siblingOrderService.inferOrderFromPositions(
      siblings,
      LAYOUT_TYPE.VERTICAL_BALANCED,
      parentPosition
    );
  },

  getEdgeHandles: (_parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo => {
    const childSide = childNode.data.side;

    if (childSide === SIDE.TOP) {
      return { sourceHandle: 'top', targetHandle: 'bottom' };
    } else {
      return { sourceHandle: 'bottom', targetHandle: 'top' };
    }
  },

  getDefaultChildSide: (_parentNode: MindMapNode, existingChildren: MindMapNode[]): Side => {
    return layoutTransitionService.getNextChildSide(existingChildren, LAYOUT_TYPE.VERTICAL_BALANCED);
  },
};
