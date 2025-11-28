import type { LayoutStrategy, LayoutType, LayoutResult, LayoutOptions } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import { LAYOUT_TYPE, DIRECTION, MINDMAP_TYPES } from '../../types';
import {
  rightOnlyLayoutStrategy,
  leftOnlyLayoutStrategy,
  bottomOnlyLayoutStrategy,
  topOnlyLayoutStrategy,
  horizontalBalancedLayoutStrategy,
  verticalBalancedLayoutStrategy,
} from './directionalLayoutStrategies';
import { updateSiblingOrdersFromPositions } from './SiblingOrderService';
import { getSubtreeNodes } from './treeUtils';

/**
 * Factory for managing layout strategies.
 * Provides a unified interface for layout operations across different layout types.
 */
class LayoutStrategyFactory {
  private strategies: Map<LayoutType, LayoutStrategy>;

  constructor() {
    this.strategies = new Map();

    // Register all layout strategies
    this.register(rightOnlyLayoutStrategy);
    this.register(leftOnlyLayoutStrategy);
    this.register(bottomOnlyLayoutStrategy);
    this.register(topOnlyLayoutStrategy);
    this.register(horizontalBalancedLayoutStrategy);
    this.register(verticalBalancedLayoutStrategy);
  }

  /**
   * Registers a layout strategy.
   */
  register(strategy: LayoutStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  /**
   * Gets a layout strategy by type.
   * Returns undefined for types that use the legacy D3LayoutService.
   */
  getStrategy(type: LayoutType): LayoutStrategy | undefined {
    return this.strategies.get(type);
  }

  /**
   * Checks if a layout type has a dedicated strategy.
   * If false, the layout should use the legacy D3LayoutService.
   */
  hasStrategy(type: LayoutType): boolean {
    return this.strategies.has(type);
  }

  /**
   * Gets all registered layout types.
   */
  getRegisteredTypes(): LayoutType[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Checks if a layout type uses legacy direction-based layout.
   * Now only NONE layout is considered legacy since we have dedicated strategies for all others.
   */
  isLegacyLayout(type: LayoutType): boolean {
    return type === LAYOUT_TYPE.NONE;
  }

  /**
   * Converts a layout type to legacy direction for backwards compatibility.
   */
  toDirection(type: LayoutType): string {
    switch (type) {
      case LAYOUT_TYPE.HORIZONTAL_BALANCED:
        return DIRECTION.HORIZONTAL;
      case LAYOUT_TYPE.VERTICAL_BALANCED:
        return DIRECTION.VERTICAL;
      default:
        return DIRECTION.NONE;
    }
  }

  /**
   * Converts a legacy direction to layout type.
   */
  fromDirection(direction: string): LayoutType {
    switch (direction) {
      case DIRECTION.HORIZONTAL:
        return LAYOUT_TYPE.HORIZONTAL_BALANCED;
      case DIRECTION.VERTICAL:
        return LAYOUT_TYPE.VERTICAL_BALANCED;
      default:
        return LAYOUT_TYPE.NONE;
    }
  }

  /**
   * Performs layout calculation using the appropriate strategy.
   *
   * IMPORTANT: Updates sibling orders from current positions BEFORE layout
   * to preserve relative positions of nodes.
   */
  async calculateLayout(
    layoutType: LayoutType,
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> {
    // Step 1: Update sibling orders from current positions to preserve relative layout
    const allNodes = [rootNode, ...descendants];
    const nodesWithUpdatedOrder = updateSiblingOrdersFromPositions(allNodes, layoutType);
    const updatedRoot = nodesWithUpdatedOrder.find((n) => n.id === rootNode.id) || rootNode;
    const updatedDescendants = nodesWithUpdatedOrder.filter((n) => n.id !== rootNode.id);

    // Use dedicated strategy for layout types
    const strategy = this.getStrategy(layoutType);
    if (strategy) {
      return strategy.calculateLayout(updatedRoot, updatedDescendants, edges, options);
    }

    // Fallback: return nodes unchanged for NONE layout type
    console.warn(`No strategy found for layout type: ${layoutType}`);
    return { nodes: [updatedRoot, ...updatedDescendants], edges };
  }

  /**
   * Performs layout for all trees in a mindmap.
   * This is the main entry point for full mindmap layout.
   *
   * IMPORTANT: Updates sibling orders from current positions BEFORE layout
   * to preserve relative positions of nodes.
   */
  async layoutAllTrees(
    layoutType: LayoutType,
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> {
    // Step 1: Update sibling orders from current positions to preserve relative layout
    const nodesWithUpdatedOrder = updateSiblingOrdersFromPositions(nodes, layoutType);

    // For NONE layout type, just return nodes as-is
    if (this.isLegacyLayout(layoutType)) {
      return { nodes: nodesWithUpdatedOrder, edges };
    }

    // Find root nodes and layout each tree
    const rootNodes = nodesWithUpdatedOrder.filter((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

    if (rootNodes.length === 0) {
      console.warn('No root nodes found');
      return { nodes: nodesWithUpdatedOrder, edges };
    }

    let allLayoutedNodes: MindMapNode[] = [];
    let allLayoutedEdges: MindMapEdge[] = [];

    for (const rootNode of rootNodes) {
      const descendantNodes = getSubtreeNodes(rootNode.id, nodesWithUpdatedOrder).filter(
        (node) => node.id !== rootNode.id
      );

      const treeNodeIds = new Set([rootNode.id, ...descendantNodes.map((n) => n.id)]);
      const treeEdges = edges.filter((edge) => treeNodeIds.has(edge.source) && treeNodeIds.has(edge.target));

      const { nodes: layoutedTreeNodes, edges: layoutedTreeEdges } = await this.calculateLayout(
        layoutType,
        rootNode,
        descendantNodes,
        treeEdges,
        options
      );

      allLayoutedNodes.push(...layoutedTreeNodes);
      allLayoutedEdges.push(...layoutedTreeEdges);
    }

    // Handle orphaned nodes and edges
    const processedNodeIds = new Set(allLayoutedNodes.map((n) => n.id));
    const orphanedNodes = nodesWithUpdatedOrder.filter((node) => !processedNodeIds.has(node.id));
    allLayoutedNodes.push(...orphanedNodes);

    const processedEdgeIds = new Set(allLayoutedEdges.map((e) => e.id));
    const orphanedEdges = edges.filter((edge) => !processedEdgeIds.has(edge.id));
    allLayoutedEdges.push(...orphanedEdges);

    return { nodes: allLayoutedNodes, edges: allLayoutedEdges };
  }
}

/**
 * Singleton instance of LayoutStrategyFactory
 */
export const layoutStrategyFactory = new LayoutStrategyFactory();
