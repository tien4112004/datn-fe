import { create } from 'zustand';
import * as d3 from 'd3';
import type { MindMapEdge, MindMapNode, Direction, LayoutType, LayoutOptions } from '../types';
import { MINDMAP_TYPES } from '../types';
import { useCoreStore } from './core';
import { devtools } from 'zustand/middleware';
import {
  fromDirection,
  toDirection,
  layoutSingleTree,
  calculateLayout,
} from '../services/layouts/layoutStrategy';
import {
  getAllDescendantNodes,
  getTreeLayoutType,
  getTreeForceLayout,
  setTreeLayoutType,
  setTreeForceLayout,
} from '../services/utils';
import { useUndoRedoStore } from './undoredo';

interface AnimationData {
  id: string;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  deltaX: number;
  deltaY: number;
}

/**
 * Default layout options for spacing
 */
const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  horizontalSpacing: 200,
  verticalSpacing: 80,
  baseRadius: 200,
  radiusIncrement: 150,
};

export interface LayoutState {
  // ===== Animation/UI State (kept in store) =====
  isLayouting: boolean;
  isAnimating: boolean;
  animationTimer: d3.Timer | null;
  animationData: AnimationData[];

  // ===== Getters for layout data from root node =====
  /**
   * Get the current layout type from the root node.
   * Returns the default layout type if no root node or no layout type set.
   */
  getLayoutType: () => LayoutType;
  /**
   * Get the current layout direction (legacy) from the root node.
   * @deprecated Use getLayoutType instead.
   */
  getLayout: () => Direction;
  /**
   * Check if auto-layout is enabled (from root node's forceLayout).
   */
  isAutoLayoutEnabled: () => boolean;

  // ===== Setters for layout data on root node =====
  /**
   * @deprecated Use setLayoutType instead.
   */
  setLayout: (direction: Direction) => void;
  /**
   * Sets the layout type on the root node.
   */
  setLayoutType: (layoutType: LayoutType) => void;
  /**
   * Enable or disable auto-layout (forceLayout on root node).
   */
  setAutoLayoutEnabled: (enabled: boolean) => void;

  // ===== Animation control =====
  setIsAnimating: (isAnimating: boolean) => void;
  stopAnimation: () => void;
  animateNodesToPositions: (
    targetPositions: Record<string, { x: number; y: number }>,
    duration?: number
  ) => void;

  // ===== Layout operations =====
  /**
   * Layout a single tree using the new layout type system.
   */
  layoutWithType: (
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    layoutType: LayoutType
  ) => Promise<{
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  }>;
  /**
   * @deprecated Use updateLayoutWithType instead.
   */
  updateLayout: (direction?: Direction) => Promise<void>;
  /**
   * Updates layout using the new layout type system.
   */
  updateLayoutWithType: (layoutType?: LayoutType) => Promise<void>;
  updateSubtreeLayout: (nodeId: string, direction: Direction) => Promise<void>;
  /**
   * @deprecated Use setLayoutType instead.
   */
  updateNodeDirection: (direction: Direction) => void;
  applyAutoLayout: () => Promise<void>;
  /**
   * @deprecated Use onLayoutTypeChange instead.
   */
  onLayoutChange: (direction: Direction) => void;
  /**
   * Handles layout type change with undo/redo support.
   */
  onLayoutTypeChange: (layoutType: LayoutType) => void;
}

const ANIMATION_DURATION = 800;

export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set, get) => ({
      // Animation/UI state
      isLayouting: false,
      isAnimating: false,
      animationTimer: null,
      animationData: [],

      // ===== Getters for layout data from root node =====
      getLayoutType: () => {
        const nodes = useCoreStore.getState().nodes;
        return getTreeLayoutType(nodes);
      },

      getLayout: () => {
        const layoutType = get().getLayoutType();
        return toDirection(layoutType) as Direction;
      },

      isAutoLayoutEnabled: () => {
        const nodes = useCoreStore.getState().nodes;
        return getTreeForceLayout(nodes);
      },

      // ===== Setters for layout data on root node =====
      setLayout: (direction) => {
        const layoutType = fromDirection(direction);
        get().setLayoutType(layoutType);
      },

      setLayoutType: (layoutType) => {
        const { setNodes } = useCoreStore.getState();
        setNodes((nodes) => setTreeLayoutType(nodes, layoutType));
      },

      setAutoLayoutEnabled: (enabled) => {
        const { setNodes } = useCoreStore.getState();
        setNodes((nodes) => setTreeForceLayout(nodes, enabled));
      },

      setIsAnimating: (isAnimating) => set({ isAnimating }, false, 'mindmap-layout/setIsAnimating'),

      stopAnimation: () => {
        const { animationTimer } = get();
        if (animationTimer) {
          animationTimer.stop();
          set(
            {
              animationTimer: null,
              isAnimating: false,
              animationData: [],
            },
            false,
            'mindmap-layout/stopAnimation'
          );
        }
      },

      animateNodesToPositions: (targetPositions, duration = 2000) => {
        const { animationTimer } = get();
        const nodes = useCoreStore.getState().nodes;
        const setNodes = useCoreStore.getState().setNodes;

        if (!nodes?.length) return;

        // Stop existing animation
        if (animationTimer) {
          animationTimer.stop();
        }

        // Store initial positions and calculate deltas
        const animationData: AnimationData[] = [];
        nodes.forEach((node) => {
          const target = targetPositions[node.id];

          if (!target) return;

          animationData.push({
            id: node.id,
            startPos: { ...node.position },
            targetPos: target || node.position,
            deltaX: target.x - (node.position.x ?? 0),
            deltaY: target.y - (node.position.y ?? 0),
          });
        });

        set(
          {
            isAnimating: true,
            animationData,
          },
          false,
          'mindmap-layout/animateNodesToPositions:start'
        );

        const timer = d3.timer((elapsed) => {
          const progress = Math.min(elapsed / duration, 1);

          // Use easing function for smoother animation
          const easedProgress = d3.easeCubicInOut(progress);

          setNodes((currentNodes: MindMapNode[]) =>
            currentNodes.map((node) => {
              const animData = animationData.find((d) => d.id === node.id);
              if (!animData) return node;

              const newX = animData.startPos.x + animData.deltaX * easedProgress;
              const newY = animData.startPos.y + animData.deltaY * easedProgress;

              return {
                ...node,
                position: { x: newX, y: newY },
              };
            })
          );

          // Stop animation when complete
          if (progress >= 1) {
            timer.stop();
            set(
              {
                animationTimer: null,
                isAnimating: false,
                animationData: [],
              },
              false,
              'mindmap-layout/animateNodesToPositions:complete'
            );
          }
        });

        set({ animationTimer: timer }, false, 'mindmap-layout/animateNodesToPositions:timer');
      },

      updateLayout: async (direction) => {
        const { getLayout, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;

        const layoutDirection = direction || getLayout();

        if (!nodes?.length || !edges) return;

        // Ensure single-root tree before performing a global update
        const rootNodes = nodes.filter((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
        if (rootNodes.length !== 1) {
          console.warn(
            `updateLayout requires a single root node. Found ${rootNodes.length}. Skipping layout.`
          );
          return;
        }

        set({ isLayouting: true }, false, 'mindmap-layout/updateLayout');

        try {
          // Convert legacy direction to layoutType
          const layoutType = fromDirection(layoutDirection);
          const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutSingleTree(
            layoutType,
            nodes,
            edges,
            DEFAULT_LAYOUT_OPTIONS
          );

          setEdges([...layoutedEdges]);

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          animateNodesToPositions(targetPositions, ANIMATION_DURATION);

          setTimeout(() => {
            set({ isLayouting: false }, false, 'mindmap-layout/updateLayout:animationEnd');
          }, ANIMATION_DURATION);
        } catch (error) {
          console.error('Layout update failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateLayout:error');
        }
      },

      updateSubtreeLayout: async (nodeId: string, direction: Direction) => {
        const { animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateSubtreeLayout');

        try {
          const rootNode = nodes.find((node) => node.id === nodeId);
          if (!rootNode) {
            console.error('Root node not found for subtree layout');
            set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:error');
            return;
          }

          const descendantNodes = getAllDescendantNodes(nodeId, nodes);

          const subtreeNodeIds = new Set([nodeId, ...descendantNodes.map((n) => n.id)]);
          const subtreeEdges = edges.filter(
            (edge) => subtreeNodeIds.has(edge.source) && subtreeNodeIds.has(edge.target)
          );

          // Convert legacy direction to layoutType
          const layoutType = fromDirection(direction);
          const { nodes: layoutedNodes, edges: layoutedEdges } = await calculateLayout(
            layoutType,
            rootNode,
            descendantNodes,
            subtreeEdges,
            DEFAULT_LAYOUT_OPTIONS
          );

          setEdges((prevEdges) => {
            const updatedEdges = prevEdges.map((edge) => {
              const layoutedEdge = layoutedEdges.find((e) => e.id === edge.id);
              return layoutedEdge ? { ...edge, ...layoutedEdge } : edge;
            });
            return updatedEdges;
          });

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          if (Object.keys(targetPositions).length > 0) {
            animateNodesToPositions(targetPositions, ANIMATION_DURATION);

            setTimeout(() => {
              set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:animationEnd');
            }, ANIMATION_DURATION);
          } else {
            set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:noChanges');
          }
        } catch (error) {
          console.error('Subtree layout update failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:error');
        }
      },

      updateNodeDirection: (direction: Direction) => {
        // Update the layout direction on root node
        get().setLayout(direction);
      },

      applyAutoLayout: async () => {
        const { getLayoutType, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;

        if (!nodes?.length || !edges) return;

        // Ensure single-root tree before performing auto layout
        const rootNodes = nodes.filter((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
        if (rootNodes.length !== 1) {
          console.warn(
            `applyAutoLayout requires a single root node. Found ${rootNodes.length}. Skipping layout.`
          );
          return;
        }

        set({ isLayouting: true }, false, 'mindmap-layout/applyAutoLayout');

        try {
          const layoutType = getLayoutType();
          const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutSingleTree(
            layoutType,
            nodes,
            edges,
            DEFAULT_LAYOUT_OPTIONS
          );

          setEdges([...layoutedEdges]);

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          animateNodesToPositions(targetPositions, ANIMATION_DURATION);

          setTimeout(() => {
            set({ isLayouting: false }, false, 'mindmap-layout/applyAutoLayout:animationEnd');
          }, ANIMATION_DURATION);
        } catch (error) {
          console.error('Auto layout application failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/applyAutoLayout:error');
        }
      },

      onLayoutChange: (direction: Direction) => {
        const { setLayout } = get();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        setLayout(direction);
        pushToUndoStack();
      },

      // ===== New Layout Type Methods =====

      layoutWithType: async (nodes, edges, layoutType) => {
        // Only layout when there is exactly one root node in the provided nodes.
        if (!nodes?.length || !edges) return { nodes, edges };

        const rootNodes = nodes.filter((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
        if (rootNodes.length !== 1) {
          console.warn(
            `layoutWithType requires a single root node. Found ${rootNodes.length}. Skipping layout.`
          );
          return { nodes, edges };
        }

        // Use strategy factory to layout the single tree
        const result = await layoutSingleTree(layoutType, nodes, edges, DEFAULT_LAYOUT_OPTIONS);
        return result;
      },

      updateLayoutWithType: async (layoutType) => {
        const { getLayoutType, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;
        const setNodes = useCoreStore.getState().setNodes;

        const targetLayoutType = layoutType || getLayoutType();

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateLayoutWithType');

        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutSingleTree(
            targetLayoutType,
            nodes,
            edges,
            DEFAULT_LAYOUT_OPTIONS
          );

          // Update edges with new handles if needed
          setEdges([...layoutedEdges]);

          // Update node data (side assignments may have changed)
          setNodes(layoutedNodes);

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          animateNodesToPositions(targetPositions, ANIMATION_DURATION);

          setTimeout(() => {
            set({ isLayouting: false }, false, 'mindmap-layout/updateLayoutWithType:animationEnd');
          }, ANIMATION_DURATION);
        } catch (error) {
          console.error('Layout update with type failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateLayoutWithType:error');
        }
      },

      onLayoutTypeChange: (layoutType: LayoutType) => {
        const { setLayoutType, updateLayoutWithType } = get();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        setLayoutType(layoutType);
        updateLayoutWithType(layoutType);
        pushToUndoStack();
      },
    }),
    { name: 'LayoutStore' }
  )
);

// ===== Backward Compatibility Exports =====
// These are kept for backward compatibility with code that expects state properties
// The actual data now lives in the root node

/**
 * @deprecated Access layout data through getLayoutType() method instead.
 * This selector is kept for backward compatibility.
 */
export const selectLayoutType = () => {
  return useLayoutStore.getState().getLayoutType();
};

/**
 * @deprecated Access layout data through getLayout() method instead.
 * This selector is kept for backward compatibility.
 */
export const selectLayout = () => {
  return useLayoutStore.getState().getLayout();
};

/**
 * @deprecated Access auto-layout setting through isAutoLayoutEnabled() method instead.
 * This selector is kept for backward compatibility.
 */
export const selectIsAutoLayoutEnabled = () => {
  return useLayoutStore.getState().isAutoLayoutEnabled();
};
