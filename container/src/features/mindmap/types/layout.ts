import type { LayoutType, MindMapNode, MindMapEdge, Side } from './mindmap';
import { LAYOUT_TYPE } from './constants';

/**
 * Handle positions used for edge connections
 */
export type HandlePosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Axis used for determining sibling order from positions
 */
export type OrderAxis = 'x' | 'y' | 'angle';

/**
 * Configuration for a layout type's behavior
 */
export interface LayoutConfig {
  /** Which handles are available for source connections */
  sourceHandles: HandlePosition[];
  /** Which handles are available for target connections */
  targetHandles: HandlePosition[];
  /** Which axis determines sibling order when inferring from positions */
  orderAxis: OrderAxis;
  /** Whether order increases (ascending) or decreases (descending) along the axis */
  orderDirection: 'ascending' | 'descending';
  /** Allowed sides for child nodes in this layout */
  allowedSides: Side[];
  /** Default side for new children */
  defaultSide: Side;
  /** Whether the layout uses angles (for radial) */
  isRadial: boolean;
}

/**
 * Result of layout calculation
 */
export interface LayoutResult {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

/**
 * Options for layout calculation
 */
export interface LayoutOptions {
  /** Horizontal spacing between parent and child nodes */
  horizontalSpacing: number;
  /** Vertical spacing between sibling nodes */
  verticalSpacing: number;
  /** For radial layouts: base radius from parent to first level children */
  baseRadius?: number;
  /** For radial layouts: additional radius per level */
  radiusIncrement?: number;
}

/**
 * Handle connection info for an edge
 */
export interface EdgeHandleInfo {
  sourceHandle: HandlePosition;
  targetHandle: HandlePosition;
}

/**
 * Sibling order assignment result
 */
export interface SiblingOrderMap {
  [nodeId: string]: number;
}

/**
 * Node position info for order inference
 */
export interface NodePositionInfo {
  id: string;
  x: number;
  y: number;
  parentId?: string;
  side: Side;
}

/**
 * Interface for layout strategy implementations
 */
export interface LayoutStrategy {
  /** The layout type this strategy handles */
  readonly type: LayoutType;

  /** Configuration for this layout */
  readonly config: LayoutConfig;

  /**
   * Calculate positions for all nodes in the tree
   * @param rootNode The root node of the tree/subtree
   * @param descendants All descendant nodes
   * @param edges Edges connecting the nodes
   * @param options Layout options (spacing, etc.)
   * @returns Positioned nodes and edges
   */
  calculateLayout(
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult>;

  /**
   * Infer sibling order from current node positions
   * @param siblings Array of sibling nodes with their current positions
   * @param parentPosition Position of the parent node (for radial calculations)
   * @returns Map of node IDs to their inferred sibling order
   */
  inferOrderFromPositions(
    siblings: NodePositionInfo[],
    parentPosition?: { x: number; y: number }
  ): SiblingOrderMap;

  /**
   * Determine which handles to use for an edge between parent and child
   * @param parentNode The parent node
   * @param childNode The child node
   * @returns Handle positions for source and target
   */
  getEdgeHandles(parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo;

  /**
   * Get the default side for a new child node
   * @param parentNode The parent node
   * @param existingChildren Existing children of the parent
   * @returns The side to assign to the new child
   */
  getDefaultChildSide(parentNode: MindMapNode, existingChildren: MindMapNode[]): Side;
}

/**
 * Static configuration for all layout types
 */
export const LAYOUT_CONFIGS: Record<LayoutType, LayoutConfig> = {
  [LAYOUT_TYPE.HORIZONTAL_BALANCED]: {
    sourceHandles: ['left', 'right'],
    targetHandles: ['left', 'right'],
    orderAxis: 'y',
    orderDirection: 'ascending',
    allowedSides: ['left', 'right', 'mid'],
    defaultSide: 'right',
    isRadial: false,
  },
  [LAYOUT_TYPE.VERTICAL_BALANCED]: {
    sourceHandles: ['top', 'bottom'],
    targetHandles: ['top', 'bottom'],
    orderAxis: 'x',
    orderDirection: 'ascending',
    allowedSides: ['left', 'right', 'mid'],
    defaultSide: 'right',
    isRadial: false,
  },
  [LAYOUT_TYPE.RIGHT_ONLY]: {
    sourceHandles: ['right'],
    targetHandles: ['left'],
    orderAxis: 'y',
    orderDirection: 'ascending',
    allowedSides: ['right'],
    defaultSide: 'right',
    isRadial: false,
  },
  [LAYOUT_TYPE.ORG_CHART]: {
    sourceHandles: ['bottom'],
    targetHandles: ['top'],
    orderAxis: 'x',
    orderDirection: 'ascending',
    allowedSides: ['right'], // We use 'right' to mean 'below' in org chart
    defaultSide: 'right',
    isRadial: false,
  },
  [LAYOUT_TYPE.RADIAL]: {
    sourceHandles: ['top', 'bottom', 'left', 'right'],
    targetHandles: ['top', 'bottom', 'left', 'right'],
    orderAxis: 'angle',
    orderDirection: 'ascending', // Clockwise from top
    allowedSides: ['left', 'right', 'mid'],
    defaultSide: 'right',
    isRadial: true,
  },
  [LAYOUT_TYPE.NONE]: {
    sourceHandles: ['left', 'right'],
    targetHandles: ['left', 'right'],
    orderAxis: 'y',
    orderDirection: 'ascending',
    allowedSides: ['left', 'right', 'mid'],
    defaultSide: 'right',
    isRadial: false,
  },
};

/**
 * Maps old Direction values to new LayoutType values for migration
 */
export const DIRECTION_TO_LAYOUT_TYPE: Record<string, LayoutType> = {
  horizontal: LAYOUT_TYPE.HORIZONTAL_BALANCED,
  vertical: LAYOUT_TYPE.VERTICAL_BALANCED,
  '': LAYOUT_TYPE.NONE,
};

/**
 * Maps new LayoutType values to old Direction values for backwards compatibility
 */
export const LAYOUT_TYPE_TO_DIRECTION: Record<LayoutType, string> = {
  [LAYOUT_TYPE.HORIZONTAL_BALANCED]: 'horizontal',
  [LAYOUT_TYPE.VERTICAL_BALANCED]: 'vertical',
  [LAYOUT_TYPE.RIGHT_ONLY]: 'horizontal', // Fallback
  [LAYOUT_TYPE.ORG_CHART]: 'vertical', // Fallback
  [LAYOUT_TYPE.RADIAL]: 'horizontal', // Fallback
  [LAYOUT_TYPE.NONE]: '',
};
