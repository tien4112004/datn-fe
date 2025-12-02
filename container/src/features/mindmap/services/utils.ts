import { Position } from '@xyflow/react';
import type { MindMapNode, Side, MindMapEdge, AiGeneratedNode, LayoutType, RootNode } from '../types';
import { MINDMAP_TYPES, SIDE, PATH_TYPES, DRAGHANDLE, LAYOUT_TYPE } from '../types';
import { generateId } from '@/shared/lib/utils';

export const getAllDescendantNodes = (parentId: string, nodes: MindMapNode[]): MindMapNode[] => {
  return nodes.reduce((acc: MindMapNode[], node: MindMapNode) => {
    if (node.data.parentId === parentId) {
      acc.push(node);
      acc.push(...getAllDescendantNodes(node.id, nodes));
    }
    return acc;
  }, []);
};

export const getRootNodeOfSubtree = (nodeId: string, nodes: MindMapNode[]): MindMapNode | null => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  if (node.type === MINDMAP_TYPES.ROOT_NODE) {
    return node;
  }

  if (!node.data.parentId) {
    return null;
  }

  return getRootNodeOfSubtree(node.data.parentId, nodes);
};

export const getSideFromPosition = (position: Position): Side => {
  switch (position) {
    case Position.Left:
      return SIDE.LEFT;
    case Position.Right:
      return SIDE.RIGHT;
    case Position.Top:
      return SIDE.LEFT;
    case Position.Bottom:
      return SIDE.RIGHT;
    default:
      throw new Error(`Unknown position: ${position}`);
  }
};

export const getOppositePosition = (position: Position): Position => {
  switch (position) {
    case Position.Left:
      return Position.Right;
    case Position.Right:
      return Position.Left;
    case Position.Top:
      return Position.Bottom;
    case Position.Bottom:
      return Position.Top;
    default:
      throw new Error(`Unknown position: ${position}`);
  }
};

/**
 * Gets the opposite side for target handle connection.
 * When a child is on the 'right' side of parent, the edge enters from the 'left' side of the child.
 */
export const getOppositeSide = (side: Side | 'mid'): Side => {
  switch (side) {
    case SIDE.LEFT:
      return SIDE.RIGHT;
    case SIDE.RIGHT:
      return SIDE.LEFT;
    case SIDE.TOP:
      return SIDE.BOTTOM;
    case SIDE.BOTTOM:
      return SIDE.TOP;
    default:
      return SIDE.LEFT; // Default for 'mid'
  }
};

export const isAiGeneratedNodeStructure = (data: any): data is AiGeneratedNode[] => {
  // Handle single object format (new AI response) by wrapping in array
  const normalizedData = Array.isArray(data) ? data : [data];

  // Empty root array is not valid, but empty children arrays are valid
  if (normalizedData.length === 0) return false;

  const isValidNode = (item: any): boolean => {
    if (typeof item !== 'object' || item === null) return false;

    // Support both 'data' (old format) and 'content' (new format)
    const hasContent = typeof item.data === 'string' || typeof item.content === 'string';
    if (!hasContent) return false;

    // Check children if present
    if (item.children !== undefined) {
      if (!Array.isArray(item.children)) return false;
      if (item.children.length > 0 && !item.children.every(isValidNode)) return false;
    }

    return true;
  };

  return normalizedData.every(isValidNode);
};

// ===== Root Node Layout Helpers =====

/**
 * Default layout type when none is specified on root node
 */
export const DEFAULT_LAYOUT_TYPE: LayoutType = LAYOUT_TYPE.HORIZONTAL_BALANCED;

/**
 * Normalize AI data to always be an array format
 * Handles both single object (new format) and array (old format)
 */
export const normalizeAiData = (data: AiGeneratedNode | AiGeneratedNode[]): AiGeneratedNode[] => {
  return Array.isArray(data) ? data : [data];
};

/**
 * Get content from AI node (supports both 'data' and 'content' properties)
 */
const getNodeContent = (aiNode: AiGeneratedNode): string => {
  return aiNode.content ?? aiNode.data ?? '';
};

/**
 * Get the appropriate side for a child node based on layout type and child index
 */
const getChildSide = (layoutType: LayoutType, childIndex: number, isRootChild: boolean): Side => {
  if (!isRootChild) {
    // Non-root children inherit side from parent (handled by caller)
    return SIDE.RIGHT; // Default fallback
  }

  switch (layoutType) {
    case LAYOUT_TYPE.HORIZONTAL_BALANCED:
      // Alternate left/right for balanced horizontal layout
      return childIndex % 2 === 0 ? SIDE.LEFT : SIDE.RIGHT;
    case LAYOUT_TYPE.VERTICAL_BALANCED:
      // Alternate left/right for balanced vertical layout (top/bottom positioning)
      return childIndex % 2 === 0 ? SIDE.LEFT : SIDE.RIGHT;
    case LAYOUT_TYPE.RIGHT_ONLY:
      return SIDE.RIGHT;
    case LAYOUT_TYPE.LEFT_ONLY:
      return SIDE.LEFT;
    case LAYOUT_TYPE.BOTTOM_ONLY:
      return SIDE.RIGHT; // Use RIGHT for bottom (maps to bottom handle)
    case LAYOUT_TYPE.TOP_ONLY:
      return SIDE.LEFT; // Use LEFT for top (maps to top handle)
    default:
      return SIDE.RIGHT;
  }
};

export const convertAiDataToMindMapNodes = (
  aiData: AiGeneratedNode | AiGeneratedNode[],
  basePosition: { x: number; y: number },
  layoutType: LayoutType = DEFAULT_LAYOUT_TYPE
): { nodes: MindMapNode[]; edges: MindMapEdge[] } => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // Normalize to array format
  const normalizedData = normalizeAiData(aiData);

  const processNode = (aiNode: AiGeneratedNode, parentId: string | null, side: Side, level: number): void => {
    const nodeId = generateId();
    const isRoot = parentId === null;
    const content = getNodeContent(aiNode);

    const mindMapNode: MindMapNode = {
      id: nodeId,
      type: isRoot ? MINDMAP_TYPES.ROOT_NODE : MINDMAP_TYPES.TEXT_NODE,
      position: isRoot ? basePosition : { x: 0, y: 0 },
      data: {
        level,
        content: `<p>${content}</p>`,
        side: isRoot ? SIDE.MID : side,
        parentId: parentId || undefined,
        pathType: PATH_TYPES.SMOOTHSTEP,
        ...(isRoot && {
          edgeColor: '#0044FF',
          layoutType,
          forceLayout: true,
        }),
      },
      ...(isRoot ? {} : { dragHandle: DRAGHANDLE.SELECTOR }),
    };

    nodes.push(mindMapNode);

    // Create edge to parent if not root
    if (parentId) {
      const edge: MindMapEdge = {
        id: generateId(),
        source: parentId,
        target: nodeId,
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: `${side}-source-${parentId}`,
        targetHandle: `${getOppositeSide(side)}-target-${nodeId}`,
        data: {
          strokeColor: '#0044FF',
          strokeWidth: 2,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };
      edges.push(edge);
    }

    // Process children
    if (aiNode.children && aiNode.children.length > 0) {
      aiNode.children.forEach((child, index) => {
        const childSide = isRoot ? getChildSide(layoutType, index, true) : side;
        processNode(child, nodeId, childSide, level + 1);
      });
    }
  };

  // Process root nodes
  if (normalizedData.length > 0) {
    normalizedData.forEach((rootNode) => {
      processNode(rootNode, null, SIDE.MID, 0);
    });
  }

  return { nodes, edges };
};

/**
 * Find the root node from a list of nodes
 * Returns the first root node found, or null if none exists
 */
export const findRootNode = (nodes: MindMapNode[]): RootNode | null => {
  return (nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE) as RootNode) || null;
};

/**
 * Find all root nodes from a list of nodes
 * Used for multi-tree support
 */
export const findAllRootNodes = (nodes: MindMapNode[]): RootNode[] => {
  return nodes.filter((n) => n.type === MINDMAP_TYPES.ROOT_NODE) as RootNode[];
};

/**
 * Get the layout type for a tree from its root node
 * Falls back to default layout type if not set
 */
export const getTreeLayoutType = (nodes: MindMapNode[]): LayoutType => {
  const rootNode = findRootNode(nodes);
  return rootNode?.data?.layoutType ?? DEFAULT_LAYOUT_TYPE;
};

/**
 * Get the layout type for a specific root node
 * Falls back to default layout type if not set
 */
export const getRootLayoutType = (rootNode: RootNode | null): LayoutType => {
  return rootNode?.data?.layoutType ?? DEFAULT_LAYOUT_TYPE;
};

/**
 * Check if force layout (auto-layout) is enabled for a tree
 */
export const getTreeForceLayout = (nodes: MindMapNode[]): boolean => {
  const rootNode = findRootNode(nodes);
  return rootNode?.data?.forceLayout ?? false;
};

/**
 * Check if force layout (auto-layout) is enabled for a specific root node
 */
export const getRootForceLayout = (rootNode: RootNode | null): boolean => {
  return rootNode?.data?.forceLayout ?? false;
};

/**
 * Update the layout type on a root node, returning updated nodes array
 */
export const setTreeLayoutType = (nodes: MindMapNode[], layoutType: LayoutType): MindMapNode[] => {
  return nodes.map((node) => {
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      return {
        ...node,
        data: {
          ...node.data,
          layoutType,
        },
      };
    }
    return node;
  });
};

/**
 * Update the force layout setting on a root node, returning updated nodes array
 */
export const setTreeForceLayout = (nodes: MindMapNode[], forceLayout: boolean): MindMapNode[] => {
  return nodes.map((node) => {
    if (node.type === MINDMAP_TYPES.ROOT_NODE) {
      return {
        ...node,
        data: {
          ...node.data,
          forceLayout,
        },
      };
    }
    return node;
  });
};

/**
 * Update layout data on a specific root node by ID, returning updated nodes array
 */
export const updateRootNodeLayoutData = (
  nodes: MindMapNode[],
  rootNodeId: string,
  layoutData: { layoutType?: LayoutType; forceLayout?: boolean }
): MindMapNode[] => {
  return nodes.map((node) => {
    if (node.id === rootNodeId && node.type === MINDMAP_TYPES.ROOT_NODE) {
      return {
        ...node,
        data: {
          ...node.data,
          ...layoutData,
        },
      };
    }
    return node;
  });
};
