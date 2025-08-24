import { Position } from '@xyflow/react';
import type { MindMapNode, Side, MindMapEdge, AiGeneratedNode } from '../types';
import { MINDMAP_TYPES, SIDE, PATH_TYPES, DRAGHANDLE } from '../types';
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

export const isAiGeneratedNodeStructure = (data: any): data is AiGeneratedNode[] => {
  if (!Array.isArray(data)) return false;

  // Empty root array is not valid, but empty children arrays are valid
  if (data.length === 0) return false;

  return data.every((item: any) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.data === 'string' &&
      (item.children === undefined ||
        (Array.isArray(item.children) &&
          (item.children.length === 0 || isAiGeneratedNodeStructure(item.children))))
    );
  });
};

export const convertAiDataToMindMapNodes = (
  aiData: AiGeneratedNode[],
  basePosition: { x: number; y: number }
): { nodes: MindMapNode[]; edges: MindMapEdge[] } => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  const processNode = (
    aiNode: AiGeneratedNode,
    parentId: string | null,
    side: Side,
    level: number,
    rootPosition?: { x: number; y: number }
  ): void => {
    const nodeId = generateId();
    const isRoot = parentId === null;

    const mindMapNode: MindMapNode = {
      id: nodeId,
      type: isRoot ? MINDMAP_TYPES.ROOT_NODE : MINDMAP_TYPES.TEXT_NODE,
      position: isRoot ? rootPosition || basePosition : { x: 0, y: 0 }, // Layout system will handle child positioning
      data: {
        level,
        content: `<p>${aiNode.data}</p>`,
        side: isRoot ? SIDE.MID : side,
        parentId: parentId || undefined,
        pathType: PATH_TYPES.SMOOTHSTEP,
        ...(isRoot && { edgeColor: 'var(--primary)' }),
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
        sourceHandle: side === SIDE.LEFT ? `first-source-${parentId}` : `second-source-${parentId}`,
        targetHandle: side === SIDE.LEFT ? `second-target-${nodeId}` : `first-target-${nodeId}`,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };
      edges.push(edge);
    }

    // Process children
    if (aiNode.children && aiNode.children.length > 0) {
      aiNode.children.forEach((child, index) => {
        const childSide = isRoot ? (index % 2 === 0 ? SIDE.LEFT : SIDE.RIGHT) : side;
        processNode(child, nodeId, childSide, level + 1);
      });
    }
  };

  // Process root nodes
  if (aiData.length > 0) {
    aiData.forEach((rootNode, index) => {
      // Only set position for the first root node, let layout handle multiple roots
      const rootPosition =
        index === 0 ? basePosition : { x: basePosition.x, y: basePosition.y + index * 200 };
      processNode(rootNode, null, SIDE.MID, 0, rootPosition);
    });
  }

  return { nodes, edges };
};
