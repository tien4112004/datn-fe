import { create } from 'zustand';
import * as d3 from 'd3';
import type { MindMapEdge, MindMapNode, LayoutType, LayoutOptions } from '../types';
import { MINDMAP_TYPES } from '../types';
import { DEFAULT_LAYOUT_TYPE } from '../services/utils';
import { useCoreStore } from './core';
import { devtools } from 'zustand/middleware';
import { layoutSingleTree, calculateLayout } from '../services/layouts/layoutStrategy';
import {
  DEFAULT_HORIZONTAL_SPACING,
  DEFAULT_VERTICAL_SPACING,
  DEFAULT_BASE_RADIUS,
  DEFAULT_RADIUS_INCREMENT,
  SPACING_PROFILES,
  type SpacingProfileName,
} from '../services/layouts/layoutConstants';
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
 * Values imported from layoutConstants to avoid magic numbers
 */
const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  horizontalSpacing: DEFAULT_HORIZONTAL_SPACING,
  verticalSpacing: DEFAULT_VERTICAL_SPACING,
  baseRadius: DEFAULT_BASE_RADIUS,
  radiusIncrement: DEFAULT_RADIUS_INCREMENT,
};

export interface LayoutState {
  isLayouting: boolean;
  isAnimating: boolean;
  animationTimer: d3.Timer | null;
  animationData: AnimationData[];

  getLayoutType: () => LayoutType;
  isAutoLayoutEnabled: () => boolean;
  getSpacingProfile: () => SpacingProfileName;

  setLayoutType: (layoutType: LayoutType) => void;
  setAutoLayoutEnabled: (enabled: boolean) => void;
  setSpacingProfile: (profile: SpacingProfileName) => void;

  // Animation control
  setIsAnimating: (isAnimating: boolean) => void;
  stopAnimation: () => void;
  animateNodesToPositions: (
    targetPositions: Record<string, { x: number; y: number }>,
    duration?: number
  ) => void;

  layoutWithType: (
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    layoutType: LayoutType
  ) => Promise<{
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  }>;
  updateLayout: (layoutType?: LayoutType) => Promise<void>;
  updateSubtreeLayout: (nodeId: string, layoutType?: LayoutType) => Promise<void>;
  applyAutoLayout: (rootNodeId: string) => Promise<void>;
  onLayoutChange: (layoutType: LayoutType) => void;
}

const ANIMATION_DURATION = 800;

let currentSpacingProfile: SpacingProfileName = 'DEFAULT';

export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set, get) => ({
      // Animation/UI state
      isLayouting: false,
      isAnimating: false,
      animationTimer: null,
      animationData: [],

      getLayoutType: () => {
        // BEFORE: O(n) search, finds first root only (broken for multi-tree)
        // const nodes = useCoreStore.getState().nodes;
        // return getTreeLayoutType(nodes);

        // AFTER: For backward compatibility, return first root's layout
        // Better: components should specify which tree they want
        const { rootLayoutTypeMap } = useCoreStore.getState();
        const firstRootType = rootLayoutTypeMap.values().next().value;
        return firstRootType ?? DEFAULT_LAYOUT_TYPE;
      },

      isAutoLayoutEnabled: () => {
        const nodes = useCoreStore.getState().nodes;
        return getTreeForceLayout(nodes);
      },

      getSpacingProfile: () => {
        return currentSpacingProfile;
      },

      setLayoutType: (layoutType) => {
        const { setNodes } = useCoreStore.getState();
        setNodes((nodes) => setTreeLayoutType(nodes, layoutType));
      },

      setAutoLayoutEnabled: (enabled) => {
        const { setNodes } = useCoreStore.getState();
        setNodes((nodes) => setTreeForceLayout(nodes, enabled));
      },

      setSpacingProfile: (profile) => {
        currentSpacingProfile = profile;
        const spacing = SPACING_PROFILES[profile];
        DEFAULT_LAYOUT_OPTIONS.horizontalSpacing = spacing.horizontal;
        DEFAULT_LAYOUT_OPTIONS.verticalSpacing = spacing.vertical;
        set({}, false, 'mindmap-layout/setSpacingProfile');
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
        // Only include nodes that have target positions (nodes in the current layout operation)
        const animationData: AnimationData[] = [];
        nodes.forEach((node) => {
          const target = targetPositions[node.id];

          // Skip nodes that don't have a target position (from other trees)
          if (!target) return;

          animationData.push({
            id: node.id,
            startPos: { ...node.position },
            targetPos: target,
            deltaX: target.x - (node.position.x ?? 0),
            deltaY: target.y - (node.position.y ?? 0),
          });
        });

        // If no nodes to animate, skip
        if (animationData.length === 0) return;

        set(
          {
            isAnimating: true,
            animationData,
          },
          false,
          'mindmap-layout/animateNodesToPositions:start'
        );

        // Create a set of node IDs being animated for quick lookup
        const animatingNodeIds = new Set(animationData.map((d) => d.id));

        const timer = d3.timer((elapsed) => {
          const progress = Math.min(elapsed / duration, 1);

          // Use easing function for smoother animation
          const easedProgress = d3.easeCubicInOut(progress);

          setNodes((currentNodes: MindMapNode[]) =>
            currentNodes.map((node) => {
              // Only animate nodes that are part of this layout operation
              if (!animatingNodeIds.has(node.id)) return node;

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

      updateLayout: async (layoutType) => {
        const { getLayoutType, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;
        const setNodes = useCoreStore.getState().setNodes;

        const targetLayoutType = layoutType || getLayoutType();

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
          const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutSingleTree(
            targetLayoutType,
            nodes,
            edges,
            DEFAULT_LAYOUT_OPTIONS
          );

          setEdges((state) => state.map((edge) => layoutedEdges.find((e) => e.id === edge.id) ?? edge));

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          animateNodesToPositions(targetPositions, ANIMATION_DURATION);

          setTimeout(() => {
            set({ isLayouting: false }, false, 'mindmap-layout/updateLayout:animationEnd');
            setNodes((state) => state.map((node) => layoutedNodes.find((n) => n.id === node.id) ?? node));
          }, ANIMATION_DURATION);
        } catch (error) {
          console.error('Layout update failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateLayout:error');
        }
      },

      updateSubtreeLayout: async (nodeId: string, layoutType?: LayoutType) => {
        const { animateNodesToPositions, getLayoutType } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;
        const setNodes = useCoreStore.getState().setNodes;

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

          const targetLayoutType = layoutType || getLayoutType();
          const { nodes: layoutedNodes, edges: layoutedEdges } = await calculateLayout(
            targetLayoutType,
            rootNode,
            descendantNodes,
            subtreeEdges,
            DEFAULT_LAYOUT_OPTIONS
          );

          setEdges((state) => state.map((edge) => layoutedEdges.find((e) => e.id === edge.id) ?? edge));

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          if (Object.keys(targetPositions).length > 0) {
            animateNodesToPositions(targetPositions, ANIMATION_DURATION);

            setTimeout(() => {
              set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:animationEnd');
              setNodes((state) => state.map((node) => layoutedNodes.find((n) => n.id === node.id) ?? node));
            }, ANIMATION_DURATION);
          } else {
            set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:noChanges');
          }
        } catch (error) {
          console.error('Subtree layout update failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:error');
        }
      },

      applyAutoLayout: async (rootNodeId: string) => {
        // Skip auto-layout in presenter mode to preserve node positions
        const { usePresenterModeStore } = await import('./presenterMode');
        const isPresenterMode = usePresenterModeStore.getState().isPresenterMode;

        if (isPresenterMode) {
          console.log('applyAutoLayout: Skipping layout in presenter mode to preserve positions');
          return;
        }

        const { animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;
        const setNodes = useCoreStore.getState().setNodes;

        if (!nodes?.length || !edges) return;

        // Find the root node by ID
        const rootNode = nodes.find((n) => n.id === rootNodeId);
        if (!rootNode) {
          console.warn(`applyAutoLayout: Root node with id "${rootNodeId}" not found. Skipping layout.`);
          return;
        }

        set({ isLayouting: true }, false, 'mindmap-layout/applyAutoLayout');

        try {
          // Get all descendant nodes for this root
          const descendantNodes = getAllDescendantNodes(rootNodeId, nodes);
          const subtreeNodes = [rootNode, ...descendantNodes];
          const subtreeNodeIds = new Set(subtreeNodes.map((n) => n.id));
          const subtreeEdges = edges.filter(
            (edge) => subtreeNodeIds.has(edge.source) && subtreeNodeIds.has(edge.target)
          );

          const layoutType = getTreeLayoutType(subtreeNodes);
          const { nodes: layoutedNodes, edges: layoutedEdges } = await calculateLayout(
            layoutType,
            rootNode,
            descendantNodes,
            subtreeEdges,
            DEFAULT_LAYOUT_OPTIONS
          );

          setEdges((state) => state.map((edge) => layoutedEdges.find((e) => e.id === edge.id) ?? edge));

          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          if (Object.keys(targetPositions).length > 0) {
            animateNodesToPositions(targetPositions, ANIMATION_DURATION);

            setTimeout(() => {
              set({ isLayouting: false }, false, 'mindmap-layout/applyAutoLayout:animationEnd');
              setNodes((state) => state.map((node) => layoutedNodes.find((n) => n.id === node.id) ?? node));
            }, ANIMATION_DURATION);
          } else {
            set({ isLayouting: false }, false, 'mindmap-layout/applyAutoLayout:noChanges');
          }
        } catch (error) {
          console.error('Auto layout application failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/applyAutoLayout:error');
        }
      },

      onLayoutChange: (layoutType: LayoutType) => {
        const { setLayoutType, updateLayout } = get();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        setLayoutType(layoutType);
        updateLayout(layoutType);
        pushToUndoStack();
      },

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
    }),
    { name: 'LayoutStore' }
  )
);

// ===== Backward Compatibility Exports =====

/**
 * @deprecated Access layout data through getLayoutType() method instead.
 * This selector is kept for backward compatibility.
 */
export const selectLayoutType = () => {
  return useLayoutStore.getState().getLayoutType();
};

/**
 * @deprecated Access auto-layout setting through isAutoLayoutEnabled() method instead.
 * This selector is kept for backward compatibility.
 */
export const selectIsAutoLayoutEnabled = () => {
  return useLayoutStore.getState().isAutoLayoutEnabled();
};
