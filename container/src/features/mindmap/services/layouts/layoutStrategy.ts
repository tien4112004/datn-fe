import type { LayoutStrategy, LayoutType, LayoutResult, LayoutOptions } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import { LAYOUT_TYPE, MINDMAP_TYPES } from '../../types';
import {
  rightOnlyLayoutStrategy,
  leftOnlyLayoutStrategy,
  bottomOnlyLayoutStrategy,
  topOnlyLayoutStrategy,
  horizontalBalancedLayoutStrategy,
  verticalBalancedLayoutStrategy,
} from './directionalLayoutStrategies';
import { updateSiblingOrdersFromPositions } from './siblingOrder';
import { getAllDescendantNodes } from '../utils';

/**
 * Static registry of all layout strategies.
 */
const strategies: Record<LayoutType, LayoutStrategy> = {
  [LAYOUT_TYPE.RIGHT_ONLY]: rightOnlyLayoutStrategy,
  [LAYOUT_TYPE.LEFT_ONLY]: leftOnlyLayoutStrategy,
  [LAYOUT_TYPE.BOTTOM_ONLY]: bottomOnlyLayoutStrategy,
  [LAYOUT_TYPE.TOP_ONLY]: topOnlyLayoutStrategy,
  [LAYOUT_TYPE.HORIZONTAL_BALANCED]: horizontalBalancedLayoutStrategy,
  [LAYOUT_TYPE.VERTICAL_BALANCED]: verticalBalancedLayoutStrategy,
};

/**
 * Gets a layout strategy by type.
 * Returns undefined for types that use the legacy D3LayoutService.
 */
export const getStrategy = (type: LayoutType): LayoutStrategy | undefined => strategies[type];

/**
 * Checks if a layout type has a dedicated strategy.
 * If false, the layout should use the legacy D3LayoutService.
 */
export const hasStrategy = (type: LayoutType): boolean => strategies[type] !== undefined;

/**
 * Gets all registered layout types.
 */
export const getRegisteredTypes = (): LayoutType[] => Object.keys(strategies) as LayoutType[];

/**
 * Performs layout calculation using the appropriate strategy.
 *
 * IMPORTANT: Updates sibling orders from current positions BEFORE layout
 * to preserve relative positions of nodes.
 */
export const calculateLayout = async (
  layoutType: LayoutType,
  rootNode: MindMapNode,
  descendants: MindMapNode[],
  edges: MindMapEdge[],
  options: LayoutOptions
): Promise<LayoutResult> => {
  // Step 1: Update sibling orders from current positions to preserve relative layout
  const allNodes = [rootNode, ...descendants];
  const nodesWithUpdatedOrder = updateSiblingOrdersFromPositions(allNodes, layoutType);
  const updatedRoot = nodesWithUpdatedOrder.find((n) => n.id === rootNode.id) || rootNode;
  const updatedDescendants = nodesWithUpdatedOrder.filter((n) => n.id !== rootNode.id);

  // Use dedicated strategy for layout types
  const strategy = getStrategy(layoutType);
  if (strategy) {
    return strategy.calculateLayout(updatedRoot, updatedDescendants, edges, options);
  }

  // Fallback: return nodes unchanged for NONE layout type
  console.warn(`No strategy found for layout type: ${layoutType}`);
  return { nodes: [updatedRoot, ...updatedDescendants], edges };
};

/**
 * Performs layout for a single tree with one root node.
 * This is the main entry point for mindmap layout.
 *
 * IMPORTANT: Updates sibling orders from current positions BEFORE layout
 * to preserve relative positions of nodes.
 *
 * @param layoutType - The layout type to use
 * @param nodes - Array of all nodes in the mindmap (must have exactly one root node)
 * @param edges - Array of all edges in the mindmap
 * @param options - Layout options for spacing
 * @returns Promise resolving to object containing all positioned nodes and edges
 */
export const layoutSingleTree = async (
  layoutType: LayoutType,
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  options: LayoutOptions
): Promise<LayoutResult> => {
  // Step 1: Update sibling orders from current positions to preserve relative layout
  const nodesWithUpdatedOrder = updateSiblingOrdersFromPositions(nodes, layoutType);

  // Find the single root node
  const rootNodes = nodesWithUpdatedOrder.filter((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

  if (rootNodes.length === 0) {
    console.warn('No root node found');
    return { nodes: nodesWithUpdatedOrder, edges };
  }

  if (rootNodes.length > 1) {
    console.warn('Multiple root nodes found, using the first one');
  }

  const rootNode = rootNodes[0];
  const descendantNodes = getAllDescendantNodes(rootNode.id, nodesWithUpdatedOrder);

  const treeNodeIds = new Set([rootNode.id, ...descendantNodes.map((n) => n.id)]);
  const treeEdges = edges.filter((edge) => treeNodeIds.has(edge.source) && treeNodeIds.has(edge.target));

  const { nodes: layoutedTreeNodes, edges: layoutedTreeEdges } = await calculateLayout(
    layoutType,
    rootNode,
    descendantNodes,
    treeEdges,
    options
  );

  // Handle orphaned nodes and edges (nodes not connected to the root)
  const processedNodeIds = new Set(layoutedTreeNodes.map((n) => n.id));
  const orphanedNodes = nodesWithUpdatedOrder.filter((node) => !processedNodeIds.has(node.id));
  const allLayoutedNodes = [...layoutedTreeNodes, ...orphanedNodes];

  const processedEdgeIds = new Set(layoutedTreeEdges.map((e) => e.id));
  const orphanedEdges = edges.filter((edge) => !processedEdgeIds.has(edge.id));
  const allLayoutedEdges = [...layoutedTreeEdges, ...orphanedEdges];

  return { nodes: allLayoutedNodes, edges: allLayoutedEdges };
};
