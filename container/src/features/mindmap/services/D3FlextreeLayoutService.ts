import type { Direction, Side, MindMapEdge, MindMapNode } from '../types';
import { MINDMAP_TYPES, DIRECTION, SIDE } from '../types';
import { flextree } from 'd3-flextree';
import type { FlextreeNode } from 'd3-flextree';
import type { HierarchyNode } from 'd3-hierarchy';

/**
 * Data structure for each node in the flextree hierarchy
 */
interface FlextreeData {
  originalNode: MindMapNode;
  children?: FlextreeData[];
}

/**
 * Extended flextree node type with width/height for convenience
 */
type FlextreeLayoutNode = FlextreeNode<FlextreeData> & {
  width: number;
  height: number;
};

/**
 * Configuration for layout spacing
 */
interface LayoutConfig {
  horizontalSpacing: number;
  verticalSpacing: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  horizontalSpacing: 200,
  verticalSpacing: 80,
};

/**
 * D3 Flextree Layout Service
 *
 * This service uses the d3-flextree plugin to layout mindmap nodes.
 * Flextree is specifically designed for variable-sized nodes, making it
 * ideal for mindmaps where nodes can have different dimensions.
 *
 * Key advantages over standard d3.tree:
 * - Native support for variable node sizes
 * - More efficient spacing calculations
 * - Better handling of asymmetric trees
 */
class D3FlextreeLayoutService {
  private config: LayoutConfig;

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Recursively collects all descendant nodes for a given root node
   *
   * This method performs a depth-first traversal to find all nodes that are
   * descendants of the specified root node, including the root itself.
   * It uses cycle detection to prevent infinite loops.
   *
   * @param rootId - The ID of the root node to start from
   * @param nodes - Array of all available nodes
   * @returns Array of nodes that are descendants of the root (including root)
   */
  getSubtreeNodes(rootId: string, nodes: MindMapNode[]): MindMapNode[] {
    const subtreeNodes: MindMapNode[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        subtreeNodes.push(node);

        // Find children of this node
        const children = nodes.filter((n) => n.data.parentId === nodeId);
        children.forEach((child) => traverse(child.id));
      }
    };

    traverse(rootId);
    return subtreeNodes;
  }

  /**
   * Recursively builds a hierarchy structure for flextree from a flat node structure
   *
   * @param startNode - The root node to build the subtree from
   * @param childrenMap - Map of parent IDs to their child nodes
   * @returns Hierarchy structure suitable for flextree layout
   */
  private buildSubtree(startNode: MindMapNode, childrenMap: Map<string, MindMapNode[]>): FlextreeData {
    const children = childrenMap.get(startNode.id) || [];
    return {
      originalNode: startNode,
      children: children.map((child) => this.buildSubtree(child, childrenMap)),
    };
  }

  /**
   * Creates a flextree hierarchy for nodes on a specific side of the root
   *
   * This method filters nodes by side (left/right) and level, then builds
   * a hierarchy structure that can be used with flextree layout algorithm.
   *
   * @param side - Which side (LEFT or RIGHT) to create hierarchy for
   * @param nodes - All available nodes
   * @param rootNode - The root node of the mindmap
   * @param childrenMap - Map of parent IDs to their child nodes
   * @param direction - Layout direction (HORIZONTAL or VERTICAL)
   * @returns Flextree hierarchy object ready for layout calculation
   */
  private createFlextreeHierarchy(
    side: Side,
    nodes: MindMapNode[],
    rootNode: MindMapNode,
    childrenMap: Map<string, MindMapNode[]>,
    direction: Direction
  ): FlextreeLayoutNode {
    const level1Nodes = nodes.filter((node) => node.data.level === 1 && node.data.side === side);
    const tree: FlextreeData = {
      originalNode: rootNode,
      children: level1Nodes.map((node) => this.buildSubtree(node, childrenMap)),
    };

    // Create flextree layout with custom node size function
    const layout = flextree<FlextreeData>({
      nodeSize: (node: HierarchyNode<FlextreeData>) => {
        const originalNode = node.data.originalNode;
        const width = originalNode.measured?.width ?? 0;
        const height = originalNode.measured?.height ?? 0;

        if (direction === DIRECTION.HORIZONTAL) {
          // For horizontal layout: [height (vertical extent), width + spacing (horizontal extent)]
          return [height + this.config.verticalSpacing, width + this.config.horizontalSpacing];
        } else {
          // For vertical layout: [width (horizontal extent), height + spacing (vertical extent)]
          return [width + this.config.horizontalSpacing, height + this.config.verticalSpacing];
        }
      },
      spacing: (a: HierarchyNode<FlextreeData>, b: HierarchyNode<FlextreeData>) => {
        // Additional spacing between non-sibling nodes
        return a.parent === b.parent ? 0 : this.config.verticalSpacing / 2;
      },
    });

    const hierarchy = layout.hierarchy(tree);
    layout(hierarchy);

    // Add width and height properties for easier access
    hierarchy.each((node) => {
      const extendedNode = node as FlextreeLayoutNode;
      extendedNode.width = node.data.originalNode.measured?.width ?? 0;
      extendedNode.height = node.data.originalNode.measured?.height ?? 0;
    });

    return hierarchy as FlextreeLayoutNode;
  }

  /**
   * Transforms flextree coordinates to mindmap coordinates based on direction and side
   *
   * Flextree outputs coordinates in a tree-centric coordinate system.
   * This method transforms them to the mindmap's coordinate system where:
   * - For HORIZONTAL: nodes extend left/right from root, siblings are arranged vertically
   * - For VERTICAL: nodes extend up/down from root, siblings are arranged horizontally
   *
   * @param node - The flextree node with calculated positions
   * @param side - Which side (LEFT or RIGHT) this node is on
   * @param rootX - X coordinate of the root node
   * @param rootY - Y coordinate of the root node
   * @param rootNode - The root node of the mindmap
   * @param direction - Layout direction (HORIZONTAL or VERTICAL)
   * @returns Object with x and y coordinates in mindmap space
   */
  private transformCoordinates(
    node: FlextreeLayoutNode,
    side: Side,
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    direction: Direction
  ): { x: number; y: number } {
    const originalNode = node.data.originalNode;

    if (originalNode.id === rootNode.id) {
      return { x: rootX, y: rootY };
    }

    // Flextree outputs: x = position along siblings axis, y = depth in tree
    const flextreeX = node.x; // Position along siblings
    const flextreeY = node.y; // Depth from root

    if (direction === DIRECTION.HORIZONTAL) {
      // Horizontal layout: tree extends left/right, siblings arranged vertically
      // flextreeX -> y position (vertical arrangement of siblings)
      // flextreeY -> x position (horizontal depth)
      const y = rootY + flextreeX - node.height / 2;

      let x: number;
      if (side === SIDE.LEFT) {
        x = rootX - flextreeY;
      } else {
        x = rootX + flextreeY;
      }

      return { x, y };
    } else {
      // Vertical layout: tree extends up/down, siblings arranged horizontally
      // flextreeX -> x position (horizontal arrangement of siblings)
      // flextreeY -> y position (vertical depth)
      const x = rootX + flextreeX - node.width / 2;

      let y: number;
      if (side === SIDE.LEFT) {
        // 'left' side in vertical mode goes upward
        y = rootY - flextreeY;
      } else {
        // 'right' side in vertical mode goes downward
        y = rootY + flextreeY;
      }

      return { x, y };
    }
  }

  /**
   * Processes a hierarchy by transforming coordinates and collecting results
   *
   * This method orchestrates the coordinate transformation for one side of the mindmap:
   * 1. Traverses all nodes in the hierarchy
   * 2. Transforms flextree coordinates to mindmap coordinates
   * 3. Collects the final positioned nodes (excluding root to avoid duplicates)
   *
   * @param hierarchy - The flextree hierarchy to process
   * @param side - Which side (LEFT or RIGHT) this hierarchy represents
   * @param rootX - X coordinate of the root node
   * @param rootY - Y coordinate of the root node
   * @param rootNode - The root node of the mindmap
   * @param layoutedNodes - Array to collect the positioned nodes
   * @param direction - Layout direction (HORIZONTAL or VERTICAL)
   */
  private processHierarchy(
    hierarchy: FlextreeLayoutNode,
    side: Side,
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    layoutedNodes: MindMapNode[],
    direction: Direction
  ): void {
    hierarchy.each((node) => {
      const extendedNode = node as FlextreeLayoutNode;
      const originalNode = node.data.originalNode;

      // Skip root node as it's handled separately
      if (originalNode.id === rootNode.id) return;

      const { x, y } = this.transformCoordinates(extendedNode, side, rootX, rootY, rootNode, direction);

      layoutedNodes.push({
        ...originalNode,
        position: { x, y },
      });
    });
  }

  /**
   * Layouts a single tree/subtree with the given root node and its descendants
   *
   * This method handles the layout of a specific tree structure using flextree,
   * positioning all nodes according to the specified direction. It accepts
   * pre-filtered descendant nodes and edges for the subtree.
   *
   * Features:
   * - Uses flextree for variable-sized node layout
   * - Maintains root node position as anchor point
   * - Supports both horizontal and vertical layout directions
   * - Handles left/right side positioning for children
   * - Applies consistent spacing between nodes and levels
   *
   * @param rootNode - The root node of the subtree to layout
   * @param descendantNodes - Array of all descendant nodes (excluding root)
   * @param descendantEdges - Array of edges connecting the subtree nodes
   * @param direction - Layout direction (HORIZONTAL, VERTICAL, or NONE)
   * @returns Promise resolving to object containing positioned nodes and edges
   */
  async layoutSubtree(
    rootNode: MindMapNode,
    descendantNodes: MindMapNode[],
    descendantEdges: MindMapEdge[],
    direction: Direction
  ): Promise<{ nodes: MindMapNode[]; edges: MindMapEdge[] }> {
    if (direction === DIRECTION.NONE) {
      return { nodes: [rootNode, ...descendantNodes], edges: descendantEdges };
    }

    const allSubtreeNodes = [rootNode, ...descendantNodes];
    if (allSubtreeNodes.length <= 1) {
      return { nodes: allSubtreeNodes, edges: descendantEdges };
    }

    const childrenMap = new Map<string, MindMapNode[]>();
    const rootX = rootNode.position?.x ?? 0;
    const rootY = rootNode.position?.y ?? 0;
    const layoutedNodes: MindMapNode[] = [];

    // Position root node at its original position
    layoutedNodes.push({
      ...rootNode,
      position: { x: rootX, y: rootY },
    });

    // Build children map for the subtree
    for (const node of allSubtreeNodes) {
      if (node.data.parentId && node.id !== rootNode.id) {
        if (!childrenMap.has(node.data.parentId)) {
          childrenMap.set(node.data.parentId, []);
        }
        childrenMap.get(node.data.parentId)!.push(node);
      }
    }

    // Create and process hierarchies for left and right sides
    const leftHierarchy = this.createFlextreeHierarchy(
      SIDE.LEFT,
      allSubtreeNodes,
      rootNode,
      childrenMap,
      direction
    );
    const rightHierarchy = this.createFlextreeHierarchy(
      SIDE.RIGHT,
      allSubtreeNodes,
      rootNode,
      childrenMap,
      direction
    );

    // Process both hierarchies
    this.processHierarchy(leftHierarchy, SIDE.LEFT, rootX, rootY, rootNode, layoutedNodes, direction);
    this.processHierarchy(rightHierarchy, SIDE.RIGHT, rootX, rootY, rootNode, layoutedNodes, direction);

    return { nodes: layoutedNodes, edges: descendantEdges };
  }

  /**
   * Layouts multiple independent trees in a mindmap
   *
   * This method is the main entry point for laying out complex mindmaps that may
   * contain multiple independent tree structures. It automatically discovers all
   * root nodes (nodes with type MINDMAP_TYPES.ROOT_NODE) and layouts each tree
   * separately using the layoutSubtree method.
   *
   * Features:
   * - Automatically discovers multiple root nodes
   * - Layouts each tree independently using flextree
   * - Handles orphaned nodes and edges not part of any tree
   * - Combines results from all trees into a single output
   *
   * @param nodes - Array of all nodes in the mindmap
   * @param edges - Array of all edges in the mindmap
   * @param direction - Layout direction (HORIZONTAL, VERTICAL, or NONE)
   * @returns Promise resolving to object containing all positioned nodes and edges
   */
  async layoutAllTrees(
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    direction: Direction
  ): Promise<{ nodes: MindMapNode[]; edges: MindMapEdge[] }> {
    if (direction === DIRECTION.NONE) {
      return { nodes, edges };
    }

    const rootNodes = nodes.filter((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

    if (rootNodes.length === 0) {
      console.warn('No root nodes found');
      return { nodes, edges };
    }

    const allLayoutedNodes: MindMapNode[] = [];
    const allLayoutedEdges: MindMapEdge[] = [];

    // Layout each tree separately
    for (const rootNode of rootNodes) {
      const descendantNodes = this.getSubtreeNodes(rootNode.id, nodes).filter(
        (node) => node.id !== rootNode.id
      );

      const treeNodeIds = new Set([rootNode.id, ...descendantNodes.map((n) => n.id)]);
      const treeEdges = edges.filter((edge) => treeNodeIds.has(edge.source) && treeNodeIds.has(edge.target));

      const { nodes: layoutedTreeNodes, edges: layoutedTreeEdges } = await this.layoutSubtree(
        rootNode,
        descendantNodes,
        treeEdges,
        direction
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

  /**
   * Updates the layout configuration
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current layout configuration
   *
   * @returns Current layout configuration
   */
  getConfig(): LayoutConfig {
    return { ...this.config };
  }
}

/**
 * Singleton instance of D3FlextreeLayoutService
 *
 * This is the main service instance used throughout the application for
 * mindmap layout operations using the flextree algorithm. Import and use
 * this instance rather than creating new instances of the class.
 *
 * @example
 * ```typescript
 * import { d3FlextreeLayoutService } from './D3FlextreeLayoutService';
 *
 * // Layout all trees in a mindmap
 * const result = await d3FlextreeLayoutService.layoutAllTrees(nodes, edges, direction);
 *
 * // Layout a specific subtree
 * const subtreeResult = await d3FlextreeLayoutService.layoutSubtree(
 *   rootNode,
 *   descendants,
 *   edges,
 *   direction
 * );
 *
 * // Update spacing configuration
 * d3FlextreeLayoutService.updateConfig({
 *   horizontalSpacing: 250,
 *   verticalSpacing: 100
 * });
 * ```
 */
export const d3FlextreeLayoutService = new D3FlextreeLayoutService();

export { D3FlextreeLayoutService };
export type { LayoutConfig };
