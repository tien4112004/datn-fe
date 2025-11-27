import type { LayoutType, MindMapNode, MindMapEdge, Side } from '../../types';
import { LAYOUT_TYPE, SIDE, MINDMAP_TYPES } from '../../types';

/**
 * Configuration for layout-specific side assignments
 */
interface LayoutSideConfig {
  /** Valid sides for child nodes in this layout */
  validSides: Side[];
  /** Default side for new children */
  defaultSide: Side;
  /** Whether to balance children across sides */
  balanced: boolean;
}

/**
 * Layout side configurations
 */
const LAYOUT_SIDE_CONFIGS: Record<LayoutType, LayoutSideConfig> = {
  [LAYOUT_TYPE.HORIZONTAL_BALANCED]: {
    validSides: [SIDE.LEFT, SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: true,
  },
  [LAYOUT_TYPE.VERTICAL_BALANCED]: {
    validSides: [SIDE.TOP, SIDE.BOTTOM],
    defaultSide: SIDE.BOTTOM,
    balanced: true,
  },
  [LAYOUT_TYPE.RIGHT_ONLY]: {
    validSides: [SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: false,
  },
  [LAYOUT_TYPE.LEFT_ONLY]: {
    validSides: [SIDE.LEFT],
    defaultSide: SIDE.LEFT,
    balanced: false,
  },
  [LAYOUT_TYPE.BOTTOM_ONLY]: {
    validSides: [SIDE.BOTTOM],
    defaultSide: SIDE.BOTTOM,
    balanced: false,
  },
  [LAYOUT_TYPE.TOP_ONLY]: {
    validSides: [SIDE.TOP],
    defaultSide: SIDE.TOP,
    balanced: false,
  },
  [LAYOUT_TYPE.NONE]: {
    validSides: [SIDE.LEFT, SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: false,
  },
};

/**
 * Maps side to the opposite side (for target handles)
 */
const OPPOSITE_SIDE: Record<Side, Side> = {
  [SIDE.LEFT]: SIDE.RIGHT,
  [SIDE.RIGHT]: SIDE.LEFT,
  [SIDE.TOP]: SIDE.BOTTOM,
  [SIDE.BOTTOM]: SIDE.TOP,
  [SIDE.MID]: SIDE.MID,
};

/**
 * Service for handling layout transitions.
 * Ensures consistent state when switching between different layout types.
 */
class LayoutTransitionService {
  /**
   * Gets the layout side configuration for a given layout type.
   */
  getLayoutConfig(layoutType: LayoutType): LayoutSideConfig {
    return LAYOUT_SIDE_CONFIGS[layoutType] || LAYOUT_SIDE_CONFIGS[LAYOUT_TYPE.HORIZONTAL_BALANCED];
  }

  /**
   * Gets the opposite side for edge target handles.
   */
  getOppositeSide(side: Side): Side {
    return OPPOSITE_SIDE[side];
  }

  /**
   * Checks if a side is valid for a given layout type.
   */
  isValidSide(side: Side, layoutType: LayoutType): boolean {
    const config = this.getLayoutConfig(layoutType);
    return config.validSides.includes(side);
  }

  /**
   * Prepares nodes and edges for a layout transition.
   * This is the main entry point for layout transitions.
   *
   * @param nodes - Current nodes
   * @param edges - Current edges
   * @param fromLayout - Source layout type
   * @param toLayout - Target layout type
   * @returns Prepared nodes and edges for the target layout
   */
  prepareTransition(
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    _fromLayout: LayoutType,
    toLayout: LayoutType
  ): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
    // Step 1: Assign sides based on target layout
    const nodesWithSides = this.assignSides(nodes, toLayout);

    // Step 2: Update edge handles based on new side assignments
    const updatedEdges = this.updateEdgeHandles(edges, nodesWithSides, toLayout);

    return { nodes: nodesWithSides, edges: updatedEdges };
  }

  /**
   * Assigns sides to nodes based on the target layout type.
   * For balanced layouts, distributes root's direct children evenly,
   * then propagates the subtree direction to all descendants.
   * For single-direction layouts, assigns all to the same side.
   */
  assignSides(nodes: MindMapNode[], layoutType: LayoutType): MindMapNode[] {
    const config = this.getLayoutConfig(layoutType);

    // Build node lookup and children map
    const nodeMap = new Map<string, MindMapNode>();
    const childrenByParent = new Map<string, MindMapNode[]>();
    const rootNodes: MindMapNode[] = [];

    for (const node of nodes) {
      nodeMap.set(node.id, node);
      if (node.type === MINDMAP_TYPES.ROOT_NODE) {
        rootNodes.push(node);
      } else if (node.data.parentId) {
        const children = childrenByParent.get(node.data.parentId) || [];
        children.push(node);
        childrenByParent.set(node.data.parentId, children);
      }
    }

    // For balanced layouts, we need to propagate subtree direction
    // Step 1: Assign sides to root's direct children (balanced distribution)
    // Step 2: Propagate those sides to all descendants in each subtree
    if (config.balanced && config.validSides.length >= 2) {
      // Map to store the subtree direction for each node
      const subtreeDirection = new Map<string, Side>();

      // Process each root node
      for (const root of rootNodes) {
        subtreeDirection.set(root.id, SIDE.MID);

        // Get direct children of root
        const directChildren = childrenByParent.get(root.id) || [];

        // Assign sides to direct children (balanced)
        const sortedChildren = [...directChildren].sort((a, b) => {
          const orderA = a.data.siblingOrder ?? 0;
          const orderB = b.data.siblingOrder ?? 0;
          return orderA - orderB;
        });

        sortedChildren.forEach((child, index) => {
          // Alternate between valid sides for direct children of root
          const sideIndex = index % config.validSides.length;
          const side = config.validSides[sideIndex];
          subtreeDirection.set(child.id, side);

          // Recursively propagate this side to all descendants
          this.propagateSubtreeDirection(child.id, side, childrenByParent, subtreeDirection);
        });
      }

      // Apply the subtree directions to nodes
      return nodes.map((node) => {
        if (node.type === MINDMAP_TYPES.ROOT_NODE) {
          return { ...node, data: { ...node.data, side: SIDE.MID } };
        }

        const side = subtreeDirection.get(node.id) ?? config.defaultSide;
        return { ...node, data: { ...node.data, side } };
      });
    }

    // For single-direction layouts, assign all to the same side
    return nodes.map((node) => {
      if (node.type === MINDMAP_TYPES.ROOT_NODE) {
        return { ...node, data: { ...node.data, side: SIDE.MID } };
      }
      return { ...node, data: { ...node.data, side: config.defaultSide } };
    });
  }

  /**
   * Recursively propagates the subtree direction to all descendants.
   * All nodes in a subtree should have the same side as their root ancestor.
   */
  private propagateSubtreeDirection(
    nodeId: string,
    side: Side,
    childrenByParent: Map<string, MindMapNode[]>,
    subtreeDirection: Map<string, Side>
  ): void {
    const children = childrenByParent.get(nodeId) || [];
    for (const child of children) {
      subtreeDirection.set(child.id, side);
      this.propagateSubtreeDirection(child.id, side, childrenByParent, subtreeDirection);
    }
  }

  /**
   * Updates edge handles based on node side assignments.
   * Uses the standardized format: {side}-source-{id} and {side}-target-{id}
   */
  updateEdgeHandles(edges: MindMapEdge[], nodes: MindMapNode[], _layoutType: LayoutType): MindMapEdge[] {
    const nodeMap = new Map<string, MindMapNode>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    return edges.map((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode || !targetNode) {
        return edge;
      }

      // Get the child's side (which determines handle positions)
      const childSide = targetNode.data.side;

      // Source handle: the side where the child is relative to parent
      // Target handle: the opposite side (where parent is relative to child)
      const sourceHandle = `${childSide}-source-${sourceNode.id}`;
      const targetHandle = `${this.getOppositeSide(childSide)}-target-${targetNode.id}`;

      return {
        ...edge,
        sourceHandle,
        targetHandle,
      };
    });
  }

  /**
   * Gets the default child side for a given layout type.
   * Used when creating new child nodes.
   */
  getDefaultChildSide(layoutType: LayoutType): Side {
    return this.getLayoutConfig(layoutType).defaultSide;
  }

  /**
   * Calculates the next side for a new child in a balanced layout.
   * Considers existing children to maintain balance.
   */
  getNextChildSide(existingChildren: MindMapNode[], layoutType: LayoutType): Side {
    const config = this.getLayoutConfig(layoutType);

    if (!config.balanced || config.validSides.length < 2) {
      return config.defaultSide;
    }

    // Count children on each valid side
    const sideCounts: Record<string, number> = {};
    for (const side of config.validSides) {
      sideCounts[side] = 0;
    }

    for (const child of existingChildren) {
      const side = child.data.side;
      if (side in sideCounts) {
        sideCounts[side]++;
      }
    }

    // Return the side with fewer children
    let minCount = Infinity;
    let minSide = config.defaultSide;

    for (const side of config.validSides) {
      if (sideCounts[side] < minCount) {
        minCount = sideCounts[side];
        minSide = side;
      }
    }

    return minSide;
  }
}

/**
 * Singleton instance
 */
export const layoutTransitionService = new LayoutTransitionService();
