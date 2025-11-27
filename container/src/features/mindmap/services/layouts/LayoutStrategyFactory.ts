import type { LayoutStrategy, LayoutType, LayoutResult, LayoutOptions } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import { LAYOUT_TYPE, DIRECTION } from '../../types';
import { rightOnlyLayoutStrategy } from './RightOnlyLayoutStrategy';
import { orgChartLayoutStrategy } from './OrgChartLayoutStrategy';
import { radialLayoutStrategy } from './RadialLayoutStrategy';
import { d3LayoutService } from '../D3LayoutService';

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
    this.register(orgChartLayoutStrategy);
    this.register(radialLayoutStrategy);
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
   */
  isLegacyLayout(type: LayoutType): boolean {
    return (
      type === LAYOUT_TYPE.HORIZONTAL_BALANCED ||
      type === LAYOUT_TYPE.VERTICAL_BALANCED ||
      type === LAYOUT_TYPE.NONE
    );
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
   * Falls back to legacy D3LayoutService for horizontal/vertical layouts.
   */
  async calculateLayout(
    layoutType: LayoutType,
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> {
    // Use legacy service for horizontal/vertical balanced layouts
    if (this.isLegacyLayout(layoutType)) {
      const direction = this.toDirection(layoutType);
      return d3LayoutService.layoutSubtree(rootNode, descendants, edges, direction as any);
    }

    // Use dedicated strategy for new layout types
    const strategy = this.getStrategy(layoutType);
    if (strategy) {
      return strategy.calculateLayout(rootNode, descendants, edges, options);
    }

    // Fallback: return nodes unchanged
    console.warn(`No strategy found for layout type: ${layoutType}`);
    return { nodes: [rootNode, ...descendants], edges };
  }

  /**
   * Performs layout for all trees in a mindmap.
   * This is the main entry point for full mindmap layout.
   */
  async layoutAllTrees(
    layoutType: LayoutType,
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult> {
    // Use legacy service for horizontal/vertical balanced layouts
    if (this.isLegacyLayout(layoutType)) {
      const direction = this.toDirection(layoutType);
      return d3LayoutService.layoutAllTrees(nodes, edges, direction as any);
    }

    // For new layout types, find root nodes and layout each tree
    const { MINDMAP_TYPES } = await import('../../types');
    const rootNodes = nodes.filter((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

    if (rootNodes.length === 0) {
      console.warn('No root nodes found');
      return { nodes, edges };
    }

    let allLayoutedNodes: MindMapNode[] = [];
    let allLayoutedEdges: MindMapEdge[] = [];

    for (const rootNode of rootNodes) {
      const descendantNodes = d3LayoutService
        .getSubtreeNodes(rootNode.id, nodes)
        .filter((node) => node.id !== rootNode.id);

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
    const orphanedNodes = nodes.filter((node) => !processedNodeIds.has(node.id));
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
