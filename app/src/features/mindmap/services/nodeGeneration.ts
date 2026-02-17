/**
 * Utilities for AI-powered node generation
 */

import type { AiGeneratedNode, MindMapNode, MindMapEdge, Side } from '../types';
import { MINDMAP_TYPES, PATH_TYPES, DRAGHANDLE, SIDE } from '../types';
import { generateId } from '@/shared/lib/utils';
import { getOppositeSide } from './utils';
import { markdownToHtml } from './utils/contentUtils';

interface ConvertChildrenResult {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

/**
 * Convert AI-generated children to ReactFlow nodes and edges.
 * Unlike convertAiDataToMindMapNodes, this creates TEXT_NODEs for children
 * and attaches them to an existing parent node.
 */
export const convertChildrenToNodes = async (
  children: AiGeneratedNode[],
  parentNode: MindMapNode
): Promise<ConvertChildrenResult> => {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // Get parent's side to inherit
  const parentSide = parentNode.data.side || SIDE.RIGHT;
  const parentLevel = parentNode.data.level || 0;

  const processChild = async (
    child: AiGeneratedNode,
    parentId: string,
    level: number,
    side: Side
  ): Promise<void> => {
    const nodeId = generateId();
    const markdown = getNodeContent(child);

    // Log for debugging empty content
    if (!markdown || markdown.trim() === '') {
      console.warn('Node expansion: Received empty content for child node', { child, nodeId, parentId });
    }

    // Convert Markdown content to HTML
    let htmlContent: string;
    try {
      htmlContent = markdown ? await markdownToHtml(markdown) : '<p>[Empty content from AI response]</p>';
    } catch (error) {
      console.error('Node expansion: Failed to convert markdown to HTML', { error, markdown, nodeId });
      // Fallback: wrap markdown in paragraph or use a placeholder
      htmlContent = markdown ? `<p>${markdown}</p>` : '<p>[Content conversion failed]</p>';
    }

    // Create TEXT_NODE child
    const childNode: MindMapNode = {
      id: nodeId,
      type: MINDMAP_TYPES.TEXT_NODE,
      position: { x: 0, y: 0 }, // Layout will position
      data: {
        level,
        content: htmlContent,
        side,
        parentId,
        pathType: PATH_TYPES.SMOOTHSTEP,
      },
      dragHandle: DRAGHANDLE.SELECTOR,
    };

    nodes.push(childNode);

    // Create edge from parent to child
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

    // Process grandchildren recursively
    if (child.children && child.children.length > 0) {
      await Promise.all(
        child.children.map((grandchild) => processChild(grandchild, nodeId, level + 1, side))
      );
    }
  };

  // Process all top-level children
  await Promise.all(children.map((child) => processChild(child, parentNode.id, parentLevel + 1, parentSide)));

  // Return nodes and edges without layout
  // Layout will be applied separately via the store
  return { nodes, edges };
};

/**
 * Get content from AI node (supports 'content' and 'data' properties)
 */
const getNodeContent = (aiNode: AiGeneratedNode): string => {
  return aiNode.content ?? aiNode.data ?? '';
};
