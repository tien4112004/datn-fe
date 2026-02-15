import type { MindMapNode } from '../../types';
import type { TreeContext } from '../../types/aiModification';
import type { MindmapMetadataResponse } from '../../types/service';

/**
 * Strip HTML tags from content to get plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Extract plain text content from a node
 */
function getNodePlainText(node: MindMapNode): string {
  return typeof node.data.content === 'string' ? stripHtml(node.data.content) : '';
}

/**
 * Build full ancestry path from root to parent (not including current node)
 */
function buildAncestryPath(currentNode: MindMapNode, allNodes: MindMapNode[]): string[] {
  const path: string[] = [];
  let node = currentNode.data.parentId ? allNodes.find((n) => n.id === currentNode.data.parentId) : undefined;

  while (node) {
    path.unshift(getNodePlainText(node));
    node = node.data.parentId ? allNodes.find((n) => n.id === node!.data.parentId) : undefined;
  }

  return path;
}

/**
 * Find sibling nodes (nodes with the same parent, excluding current)
 */
function findSiblings(currentNode: MindMapNode, allNodes: MindMapNode[]): MindMapNode[] {
  return allNodes.filter((n) => n.id !== currentNode.id && n.data.parentId === currentNode.data.parentId);
}

/**
 * Build TreeContext from current node and tree state
 */
export function buildTreeContext(
  nodeId: string,
  nodes: MindMapNode[],
  metadata?: MindmapMetadataResponse
): TreeContext {
  const currentNode = nodes.find((n) => n.id === nodeId);
  if (!currentNode) {
    console.warn(`buildTreeContext: Node ${nodeId} not found`);
    return {};
  }

  // Find parent node
  const parent = currentNode.data.parentId
    ? nodes.find((n) => n.id === currentNode.data.parentId)
    : undefined;

  // Build full ancestry path (root to immediate parent)
  const ancestryPath = buildAncestryPath(currentNode, nodes);

  // Find sibling nodes
  const siblings = findSiblings(currentNode, nodes);
  const siblingContents = siblings.map(getNodePlainText).filter((s) => s.length > 0);

  // Root content is first in ancestry path (if exists)
  const rootNodeContent = ancestryPath.length > 0 ? ancestryPath[0] : undefined;

  return {
    mindmapId: metadata?.mindmapId,
    mindmapTitle: metadata?.title,
    rootNodeId: metadata?.rootNodeId,
    rootNodeContent,
    currentLevel: currentNode.data.level || 0,
    parentContent: parent ? getNodePlainText(parent) : undefined,
    siblingContents: siblingContents.length > 0 ? siblingContents : undefined,
    fullAncestryPath: ancestryPath.length > 0 ? ancestryPath : undefined,
  };
}
