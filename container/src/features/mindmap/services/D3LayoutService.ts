import type { Direction, Side, MindMapEdge, MindMapNode } from '../types';
import { MINDMAP_TYPES, DIRECTION, SIDE } from '../types';
import * as d3 from 'd3';

interface HierarchyNode {
  originalNode: MindMapNode;
  children?: HierarchyNode[];
}

type D3HierarchyNode = d3.HierarchyNode<HierarchyNode> & {
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight?: number;
  children?: D3HierarchyNode[];
  parent?: D3HierarchyNode | null;
};

class D3LayoutService {
  /**
   * Calculates the total height required for a subtree including all its children
   *
   * This method recursively computes the height needed to display a node and all
   * its descendants, taking into account vertical spacing between siblings.
   * The result is cached on the node to avoid recalculation.
   *
   * @param node - The hierarchy node to calculate height for
   * @param verticalSpacing - Vertical spacing between sibling nodes
   * @returns The total height required for the subtree
   */
  calculateSubtreeHeight(node: D3HierarchyNode, verticalSpacing: number): number {
    if (node.subtreeHeight !== undefined) {
      return node.subtreeHeight;
    }

    const nodeHeight = node.height;

    if (!node.children || node.children.length === 0) {
      node.subtreeHeight = nodeHeight;
      return nodeHeight;
    }

    const childrenHeights = node.children.map((child: any) =>
      this.calculateSubtreeHeight(child, verticalSpacing)
    );
    const totalChildrenHeight = childrenHeights.reduce((sum: number, height: number) => sum + height, 0);
    const spacingHeight = (node.children.length - 1) * verticalSpacing;

    node.subtreeHeight = Math.max(nodeHeight, totalChildrenHeight + spacingHeight);

    return node.subtreeHeight;
  }

  /**
   * Preprocesses a hierarchy to add width and height properties for easier access
   *
   * This method traverses the hierarchy and populates width and height properties
   * directly on each node, eliminating the need for long property access chains
   * like node.data.originalNode.measured?.width ?? 0.
   *
   * @param hierarchy - The D3 hierarchy to preprocess
   */
  private preprocessHierarchy(hierarchy: D3HierarchyNode): void {
    hierarchy.eachBefore((node: D3HierarchyNode) => {
      node.width = node.data.originalNode.measured?.width ?? 0;
      node.height = node.data.originalNode.measured?.height ?? 0;
    });
  }

  /**
   * Positions all nodes in a hierarchy based on the layout direction and side
   *
   * This method traverses the entire hierarchy and calculates the x,y coordinates
   * for each node based on the specified direction (horizontal/vertical) and side
   * (left/right). It handles parent-child relationships and sibling positioning.
   *
   * @param hierarchy - The D3 hierarchy containing all nodes to position
   * @param side - Which side of the root (LEFT or RIGHT) this hierarchy represents
   * @param rootX - X coordinate of the root node
   * @param rootY - Y coordinate of the root node
   * @param rootNode - The root node of the mindmap
   * @param horizontalSpacing - Horizontal spacing between levels
   * @param verticalSpacing - Vertical spacing between siblings
   * @param direction - Layout direction (HORIZONTAL or VERTICAL)
   */
  positionHierarchy(
    hierarchy: D3HierarchyNode,
    side: Side,
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    horizontalSpacing: number,
    verticalSpacing: number,
    direction: Direction
  ) {
    hierarchy.descendants().forEach((node: D3HierarchyNode) => {
      const originalNode = node.data.originalNode;
      if (!originalNode) return;

      if (originalNode.id === rootNode.id) {
        node.x = rootX;
        node.y = rootY;
      } else {
        // Position based on direction and side
        if (node.parent) {
          if (direction === DIRECTION.HORIZONTAL) {
            // Horizontal layout: extend left/right from parent
            if (side === SIDE.LEFT) {
              node.x = node.parent.x - horizontalSpacing - node.width;
            } else {
              node.x = node.parent.x + horizontalSpacing + node.parent.width;
            }
          } else if (direction === DIRECTION.VERTICAL) {
            // Vertical layout: extend top/bottom from parent
            if (side === SIDE.LEFT) {
              // In vertical layout, 'left' side goes up
              node.y = node.parent.y - verticalSpacing - node.height;
            } else {
              // In vertical layout, 'right' side goes down
              node.y = node.parent.y + verticalSpacing + node.parent.height;
            }
          }
        }

        if (node.parent?.children) {
          const siblings = node.parent.children;
          const siblingIndex = siblings.indexOf(node);

          let cumulativeOffset = 0;
          for (let i = 0; i < siblingIndex; i++) {
            cumulativeOffset += (siblings[i].subtreeHeight || 0) + verticalSpacing;
          }

          const totalSubtreesHeight = siblings.reduce(
            (sum: number, sibling: D3HierarchyNode) => sum + (sibling.subtreeHeight || 0),
            0
          );
          const totalSpacing = (siblings.length - 1) * verticalSpacing;
          const totalLayoutHeight = totalSubtreesHeight + totalSpacing;

          if (direction === DIRECTION.HORIZONTAL) {
            // Horizontal direction - position siblings vertically
            if (siblings.length === 1) {
              node.y = node.parent!.y + node.parent!.height / 2 - node.height / 2;
            } else {
              node.y = node.parent!.y - totalLayoutHeight / 2 + cumulativeOffset;
            }
          } else if (direction === DIRECTION.VERTICAL) {
            // Vertical direction - position siblings horizontally
            if (siblings.length === 1) {
              node.x = node.parent!.x + node.parent!.width / 2 - node.width / 2;
            } else {
              // For vertical directions, we need to calculate width-based spacing
              const totalSubtreesWidth = siblings.reduce(
                (sum: number, sibling: D3HierarchyNode) => sum + sibling.width,
                0
              );
              const totalWidthSpacing = (siblings.length - 1) * horizontalSpacing;
              const totalLayoutWidth = totalSubtreesWidth + totalWidthSpacing;

              let widthCumulativeOffset = 0;
              for (let i = 0; i < siblingIndex; i++) {
                widthCumulativeOffset += siblings[i].width + horizontalSpacing;
              }

              node.x = node.parent!.x - totalLayoutWidth / 2 + widthCumulativeOffset;
            }
          }
        }
      }
    });
  }

  /**
   * Gets the bottom Y coordinate of a subtree (lowest point)
   *
   * @param node - The hierarchy node to analyze
   * @returns The bottom Y coordinate of the subtree
   */
  getSubtreeBottomY(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.y + node.height;
    }

    return Math.max(...node.children.map((child: D3HierarchyNode) => this.getSubtreeBottomY(child)));
  }

  /**
   * Gets the top Y coordinate of a subtree (highest point)
   *
   * @param node - The hierarchy node to analyze
   * @returns The top Y coordinate of the subtree
   */
  getSubtreeTopY(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.y;
    }

    return Math.min(...node.children.map((child: D3HierarchyNode) => this.getSubtreeTopY(child)));
  }

  /**
   * Gets the rightmost X coordinate of a subtree
   *
   * @param node - The hierarchy node to analyze
   * @returns The rightmost X coordinate of the subtree
   */
  getSubtreeRightX(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.x + node.width;
    }

    return Math.max(...node.children.map((child: D3HierarchyNode) => this.getSubtreeRightX(child)));
  }

  /**
   * Gets the leftmost X coordinate of a subtree
   *
   * @param node - The hierarchy node to analyze
   * @returns The leftmost X coordinate of the subtree
   */
  getSubtreeLeftX(node: D3HierarchyNode): number {
    if (!node.children || node.children.length === 0) {
      return node.x;
    }

    return Math.min(...node.children.map((child: D3HierarchyNode) => this.getSubtreeLeftX(child)));
  }

  /**
   * Recursively adjusts the position of a subtree by applying offsets
   *
   * @param node - The root node of the subtree to adjust
   * @param yOffset - Y coordinate offset to apply
   * @param xOffset - X coordinate offset to apply (optional, defaults to 0)
   */
  adjustSubtreePosition(node: D3HierarchyNode, yOffset: number, xOffset: number = 0) {
    node.y += yOffset;
    node.x += xOffset;
    if (node.children) {
      node.children.forEach((child: D3HierarchyNode) => this.adjustSubtreePosition(child, yOffset, xOffset));
    }
  }

  /**
   * Adjusts spacing between sibling subtrees to maintain consistent gaps
   *
   * This method analyzes the actual spacing between adjacent subtrees and
   * applies corrections to achieve the desired spacing. It works recursively
   * through the hierarchy to ensure consistent spacing at all levels.
   *
   * @param node - The parent node whose children need spacing adjustment
   * @param direction - Layout direction (affects whether to adjust X or Y spacing)
   * @param spacing - The desired spacing between siblings
   */
  adjustSpacing(node: D3HierarchyNode, direction: Direction, spacing: number) {
    if (!node.children || node.children.length <= 1) return;

    const children = node.children;
    const spacingErrors: number[] = [];

    if (direction === DIRECTION.HORIZONTAL) {
      // For horizontal directions, adjust vertical spacing between siblings
      for (let i = 1; i < children.length; i++) {
        const prevBottom = this.getSubtreeBottomY(children[i - 1]);
        const currentTop = this.getSubtreeTopY(children[i]);
        const actualSpacing = currentTop - prevBottom;
        spacingErrors.push(spacing - actualSpacing);
      }

      if (spacingErrors.some((error) => Math.abs(error) > 0.1)) {
        const totalError = spacingErrors.reduce((sum, error) => sum + error, 0);
        const averageAdjustment = totalError / children.length;

        let cumulativeAdjustment = -averageAdjustment;

        children.forEach((child: D3HierarchyNode, index: number) => {
          if (index > 0) {
            cumulativeAdjustment += spacingErrors[index - 1];
          }

          this.adjustSubtreePosition(child, cumulativeAdjustment, 0);
        });
      }
    } else if (direction === DIRECTION.VERTICAL) {
      // For vertical directions, adjust horizontal spacing between siblings
      for (let i = 1; i < children.length; i++) {
        const prevRight = this.getSubtreeRightX(children[i - 1]);
        const currentLeft = this.getSubtreeLeftX(children[i]);
        const actualSpacing = currentLeft - prevRight;
        spacingErrors.push(spacing - actualSpacing);
      }

      if (spacingErrors.some((error) => Math.abs(error) > 0.1)) {
        const totalError = spacingErrors.reduce((sum, error) => sum + error, 0);
        const averageAdjustment = totalError / children.length;

        let cumulativeAdjustment = -averageAdjustment;

        children.forEach((child: D3HierarchyNode, index: number) => {
          if (index > 0) {
            cumulativeAdjustment += spacingErrors[index - 1];
          }

          this.adjustSubtreePosition(child, 0, cumulativeAdjustment);
        });
      }
    }

    children.forEach((child: D3HierarchyNode) => this.adjustSpacing(child, direction, spacing));
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
   * Recursively builds a hierarchy structure for D3 from a flat node structure
   *
   * @param startNode - The root node to build the subtree from
   * @param childrenMap - Map of parent IDs to their child nodes
   * @returns Hierarchy structure suitable for D3 tree layout
   */
  buildSubtree(startNode: MindMapNode, childrenMap: Map<string, MindMapNode[]>): HierarchyNode {
    const children = childrenMap.get(startNode.id) || [];
    return {
      originalNode: startNode,
      children: children.map((child) => this.buildSubtree(child, childrenMap)),
    };
  }

  /**
   * Creates a D3 hierarchy for nodes on a specific side of the root
   *
   * This method filters nodes by side (left/right) and level, then builds
   * a D3 hierarchy structure that can be used with D3's tree layout algorithm.
   *
   * @param side - Which side (LEFT or RIGHT) to create hierarchy for
   * @param nodes - All available nodes
   * @param rootNode - The root node of the mindmap
   * @param childrenMap - Map of parent IDs to their child nodes
   * @returns D3 hierarchy object ready for layout calculation
   */
  createHierarchy(
    side: Side,
    nodes: MindMapNode[],
    rootNode: MindMapNode,
    childrenMap: Map<string, MindMapNode[]>
  ): D3HierarchyNode {
    const level1Nodes = nodes.filter((node) => node.data.level === 1 && node.data.side === side);
    const tree = {
      originalNode: rootNode,
      children: level1Nodes.map((node) => this.buildSubtree(node, childrenMap)),
    };

    const hierarchy = d3.hierarchy<HierarchyNode>(tree) as D3HierarchyNode;
    const treeLayout = d3.tree<HierarchyNode>().nodeSize([0, 200]);
    treeLayout(hierarchy);

    // Preprocess hierarchy to add width and height properties
    this.preprocessHierarchy(hierarchy);

    return hierarchy;
  }

  /**
   * Processes a hierarchy by calculating subtree heights, positioning nodes, and collecting results
   *
   * This method orchestrates the complete layout process for one side of the mindmap:
   * 1. Calculates subtree heights for proper spacing
   * 2. Positions all nodes according to the layout direction
   * 3. Adjusts spacing to maintain consistency
   * 4. Collects the final positioned nodes
   *
   * @param hierarchy - The D3 hierarchy to process
   * @param side - Which side (LEFT or RIGHT) this hierarchy represents
   * @param rootX - X coordinate of the root node
   * @param rootY - Y coordinate of the root node
   * @param rootNode - The root node of the mindmap
   * @param horizontalSpacing - Horizontal spacing between levels
   * @param verticalSpacing - Vertical spacing between siblings
   * @param layoutedNodes - Array to collect the positioned nodes
   * @param direction - Layout direction (HORIZONTAL or VERTICAL)
   */
  processHierarchy(
    hierarchy: D3HierarchyNode,
    side: Side,
    rootX: number,
    rootY: number,
    rootNode: MindMapNode,
    horizontalSpacing: number,
    verticalSpacing: number,
    layoutedNodes: MindMapNode[],
    direction: Direction
  ) {
    hierarchy.eachAfter((node: D3HierarchyNode) => {
      node.subtreeHeight = this.calculateSubtreeHeight(node, verticalSpacing);
    });

    this.positionHierarchy(
      hierarchy,
      side,
      rootX,
      rootY,
      rootNode,
      horizontalSpacing,
      verticalSpacing,
      direction
    );

    // Use appropriate spacing based on layout direction
    const spacing = direction === DIRECTION.HORIZONTAL ? verticalSpacing : horizontalSpacing;
    this.adjustSpacing(hierarchy, direction, spacing);

    hierarchy.each((node: D3HierarchyNode) => {
      const originalNode = node.data.originalNode;
      if (originalNode && originalNode.id !== rootNode.id) {
        layoutedNodes.push({
          ...originalNode,
          position: {
            x: node.x,
            y: node.y,
          },
        });
      }
    });
  }

  /**
   * Layouts a single tree/subtree with the given root node and its descendants
   *
   * This method handles the layout of a specific tree structure, positioning all nodes
   * according to the specified direction. It accepts pre-filtered descendant nodes and
   * edges for the subtree, making it efficient for partial layout operations.
   *
   * Features:
   * - Accepts pre-filtered nodes and edges for the subtree
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
   *
   * @example
   * ```typescript
   * const result = await layoutSubtree(
   *   rootNode,
   *   childNodes,
   *   subtreeEdges,
   *   DIRECTION.HORIZONTAL
   * );
   * ```
   */
  async layoutSubtree(
    rootNode: MindMapNode,
    descendantNodes: MindMapNode[],
    descendantEdges: MindMapEdge[],
    direction: Direction
  ) {
    if (direction === DIRECTION.NONE)
      return { nodes: [rootNode, ...descendantNodes], edges: descendantEdges };

    const allSubtreeNodes = [rootNode, ...descendantNodes];
    if (allSubtreeNodes.length <= 1) return { nodes: allSubtreeNodes, edges: descendantEdges };

    const nodeMap = new Map<string, MindMapNode>();
    const childrenMap = new Map<string, MindMapNode[]>();

    const rootX = rootNode.position?.x ?? 0;
    const rootY = rootNode.position?.y ?? 0;
    const layoutedNodes: MindMapNode[] = [];

    // Position root node at its original position
    layoutedNodes.push({
      ...rootNode,
      position: { x: rootX, y: rootY },
    });

    // Build maps for the subtree
    for (const node of allSubtreeNodes) {
      nodeMap.set(node.id, node);

      if (node.data.parentId && node.id !== rootNode.id) {
        if (!childrenMap.has(node.data.parentId)) {
          childrenMap.set(node.data.parentId, []);
        }
        childrenMap.get(node.data.parentId)!.push(node);
      }
    }

    // Create hierarchies for left and right sides
    const leftHierarchy = this.createHierarchy(SIDE.LEFT, allSubtreeNodes, rootNode, childrenMap);
    const rightHierarchy = this.createHierarchy(SIDE.RIGHT, allSubtreeNodes, rootNode, childrenMap);

    const HORIZONTAL_SPACING = 200;
    const VERTICAL_SPACING = 80;

    // Process both hierarchies with the given direction
    this.processHierarchy(
      leftHierarchy,
      SIDE.LEFT,
      rootX,
      rootY,
      rootNode,
      HORIZONTAL_SPACING,
      VERTICAL_SPACING,
      layoutedNodes,
      direction
    );
    this.processHierarchy(
      rightHierarchy,
      SIDE.RIGHT,
      rootX,
      rootY,
      rootNode,
      HORIZONTAL_SPACING,
      VERTICAL_SPACING,
      layoutedNodes,
      direction
    );

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
   * - Layouts each tree independently using layoutSubtree
   * - Handles orphaned nodes and edges not part of any tree
   * - Combines results from all trees into a single output
   * - Maintains consistent spacing and positioning across all trees
   *
   * Process:
   * 1. Find all nodes with ROOT_NODE type
   * 2. For each root, collect its descendant nodes and edges
   * 3. Layout each tree using layoutSubtree
   * 4. Combine all results and include orphaned elements
   *
   * @param nodes - Array of all nodes in the mindmap
   * @param edges - Array of all edges in the mindmap
   * @param direction - Layout direction (HORIZONTAL, VERTICAL, or NONE)
   * @returns Promise resolving to object containing all positioned nodes and edges
   *
   * @example
   * ```typescript
   * const result = await layoutAllTrees(
   *   allNodes,
   *   allEdges,
   *   DIRECTION.HORIZONTAL
   * );
   * ```
   */
  async layoutAllTrees(nodes: MindMapNode[], edges: MindMapEdge[], direction: Direction) {
    if (direction === DIRECTION.NONE) return { nodes, edges };

    const rootNodes = nodes.filter((node) => node.type === MINDMAP_TYPES.ROOT_NODE);

    if (rootNodes.length === 0) {
      console.warn('No root nodes found');
      return { nodes, edges };
    }

    let allLayoutedNodes: MindMapNode[] = [];
    let allLayoutedEdges: MindMapEdge[] = [];

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
}

/**
 * Singleton instance of D3LayoutService
 *
 * This is the main service instance used throughout the application for
 * mindmap layout operations. Import and use this instance rather than
 * creating new instances of the D3LayoutService class.
 *
 * @example
 * ```typescript
 * import { d3LayoutService } from './D3LayoutService';
 *
 * // Layout all trees in a mindmap
 * const result = await d3LayoutService.layoutAllTrees(nodes, edges, direction);
 *
 * // Layout a specific subtree
 * const subtreeResult = await d3LayoutService.layoutSubtree(
 *   rootNode,
 *   descendants,
 *   edges,
 *   direction
 * );
 * ```
 */
export const d3LayoutService = new D3LayoutService();
