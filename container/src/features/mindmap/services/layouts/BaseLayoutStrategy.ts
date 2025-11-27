import type {
  LayoutStrategy,
  LayoutConfig,
  LayoutResult,
  LayoutOptions,
  EdgeHandleInfo,
  NodePositionInfo,
  SiblingOrderMap,
  LayoutType,
} from '../../types';
import type { MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_CONFIGS } from '../../types';
import { siblingOrderService } from '../SiblingOrderService';

/**
 * Abstract base class for layout strategies.
 * Provides common functionality and defines the interface for concrete implementations.
 */
export abstract class BaseLayoutStrategy implements LayoutStrategy {
  abstract readonly type: LayoutType;

  get config(): LayoutConfig {
    return LAYOUT_CONFIGS[this.type];
  }

  /**
   * Sorts an array of nodes by their siblingOrder property.
   */
  protected sortBySiblingOrder(nodes: MindMapNode[]): MindMapNode[] {
    return [...nodes].sort((a, b) => {
      const orderA = a.data.siblingOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.data.siblingOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }

  /**
   * Groups nodes by their parent ID.
   */
  protected groupByParent(nodes: MindMapNode[]): Map<string, MindMapNode[]> {
    const groups = new Map<string, MindMapNode[]>();

    for (const node of nodes) {
      const parentId = node.data.parentId;
      if (!parentId) continue;

      if (!groups.has(parentId)) {
        groups.set(parentId, []);
      }
      groups.get(parentId)!.push(node);
    }

    // Sort children by siblingOrder for each parent
    for (const [parentId, children] of groups) {
      groups.set(parentId, this.sortBySiblingOrder(children));
    }

    return groups;
  }

  /**
   * Groups nodes by their parent ID and side.
   */
  protected groupByParentAndSide(nodes: MindMapNode[]): Map<string, MindMapNode[]> {
    const groups = new Map<string, MindMapNode[]>();

    for (const node of nodes) {
      const parentId = node.data.parentId;
      if (!parentId) continue;

      const key = `${parentId}-${node.data.side}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    }

    // Sort children by siblingOrder for each group
    for (const [key, children] of groups) {
      groups.set(key, this.sortBySiblingOrder(children));
    }

    return groups;
  }

  /**
   * Creates a map of node IDs to their positions.
   */
  protected createPositionMap(nodes: MindMapNode[]): Map<string, { x: number; y: number }> {
    const map = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
      if (node.position) {
        map.set(node.id, { x: node.position.x, y: node.position.y });
      }
    }
    return map;
  }

  /**
   * Updates edge handles based on the layout strategy.
   * This method should be called after node positions are calculated.
   *
   * @param edges - The edges to update
   * @param layoutedNodes - The nodes with updated positions
   * @returns Updated edges with proper sourceHandle and targetHandle
   */
  protected updateEdgeHandles(edges: MindMapEdge[], layoutedNodes: MindMapNode[]): MindMapEdge[] {
    const nodeMap = new Map<string, MindMapNode>();
    for (const node of layoutedNodes) {
      nodeMap.set(node.id, node);
    }

    return edges.map((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode || !targetNode) {
        return edge;
      }

      const handles = this.getEdgeHandles(sourceNode, targetNode);

      return {
        ...edge,
        sourceHandle: `${handles.sourceHandle}-source-${sourceNode.id}`,
        targetHandle: `${handles.targetHandle}-target-${targetNode.id}`,
      };
    });
  }

  /**
   * Default implementation of order inference using the SiblingOrderService.
   */
  inferOrderFromPositions(
    siblings: NodePositionInfo[],
    parentPosition?: { x: number; y: number }
  ): SiblingOrderMap {
    return siblingOrderService.inferOrderFromPositions(siblings, this.type, parentPosition);
  }

  /**
   * Abstract method to calculate layout - must be implemented by concrete strategies.
   */
  abstract calculateLayout(
    rootNode: MindMapNode,
    descendants: MindMapNode[],
    edges: MindMapEdge[],
    options: LayoutOptions
  ): Promise<LayoutResult>;

  /**
   * Abstract method to get edge handles - must be implemented by concrete strategies.
   */
  abstract getEdgeHandles(parentNode: MindMapNode, childNode: MindMapNode): EdgeHandleInfo;

  /**
   * Abstract method to get default child side - must be implemented by concrete strategies.
   */
  abstract getDefaultChildSide(parentNode: MindMapNode, existingChildren: MindMapNode[]): Side;
}
