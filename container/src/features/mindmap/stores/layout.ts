import { create } from 'zustand';
import * as d3 from 'd3';
import type { MindMapEdge, MindMapNode, Direction, LayoutType, LayoutOptions } from '../types';
import { LAYOUT_TYPE } from '../types';
import { useCoreStore } from './core';
import { devtools } from 'zustand/middleware';
import { d3LayoutService } from '../services/D3LayoutService';
import { layoutStrategyFactory } from '../services/layouts/LayoutStrategyFactory';
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
  /**
   * @deprecated Use layoutType instead. This is kept for backward compatibility.
   */
  layout: Direction;
  /**
   * The current layout type used for node arrangement.
   */
  layoutType: LayoutType;
  isAutoLayoutEnabled: boolean;
  isLayouting: boolean;
  isAnimating: boolean;
  animationTimer: d3.Timer | null;
  animationData: AnimationData[];
  /**
   * @deprecated Use setLayoutType instead.
   */
  setLayout: (direction: Direction) => void;
  /**
   * Sets the layout type and updates the legacy direction for compatibility.
   */
  setLayoutType: (layoutType: LayoutType) => void;
  setAutoLayoutEnabled: (enabled: boolean) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  stopAnimation: () => void;
  layoutAllTrees: (
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    direction: Direction
  ) => Promise<{
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  }>;
  /**
   * Layout all trees using the new layout type system.
   */
  layoutAllTreesWithType: (
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    layoutType: LayoutType
  ) => Promise<{
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  }>;
  animateNodesToPositions: (
    targetPositions: Record<string, { x: number; y: number }>,
    duration?: number
  ) => void;
  updateLayout: (direction?: Direction) => Promise<void>;
  /**
   * Updates layout using the new layout type system.
   */
  updateLayoutWithType: (layoutType?: LayoutType) => Promise<void>;
  updateSubtreeLayout: (nodeId: string, direction: Direction) => Promise<void>;
  updateNodeDirection: (direction: Direction) => void;
  applyAutoLayout: () => Promise<void>;
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
      layout: 'horizontal',
      layoutType: LAYOUT_TYPE.HORIZONTAL_BALANCED,
      isAutoLayoutEnabled: false,
      isLayouting: false,
      isAnimating: false,
      animationTimer: null,
      animationData: [],

      setLayout: (direction) => {
        // Convert direction to layout type for consistency
        const layoutType = layoutStrategyFactory.fromDirection(direction);
        set({ layout: direction, layoutType }, false, 'mindmap-layout/setLayout');
      },

      setLayoutType: (layoutType) => {
        // Also update legacy direction for backward compatibility
        const direction = layoutStrategyFactory.toDirection(layoutType) as Direction;
        set({ layoutType, layout: direction }, false, 'mindmap-layout/setLayoutType');
      },

      setAutoLayoutEnabled: (enabled) =>
        set({ isAutoLayoutEnabled: enabled }, false, 'mindmap-layout/setAutoLayoutEnabled'),
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
        const { layout, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;

        const layoutDirection = direction || layout;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateLayout');

        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } = await d3LayoutService.layoutAllTrees(
            nodes,
            edges,
            layoutDirection
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

          const descendantNodes = d3LayoutService
            .getSubtreeNodes(nodeId, nodes)
            .filter((node) => node.id !== nodeId);

          const subtreeNodeIds = new Set([nodeId, ...descendantNodes.map((n) => n.id)]);
          const subtreeEdges = edges.filter(
            (edge) => subtreeNodeIds.has(edge.source) && subtreeNodeIds.has(edge.target)
          );

          const { nodes: layoutedNodes, edges: layoutedEdges } = await d3LayoutService.layoutSubtree(
            rootNode,
            descendantNodes,
            subtreeEdges,
            direction
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
        // Update the layout direction state
        set({ layout: direction }, false, 'mindmap-layout/updateNodeDirection');
      },

      applyAutoLayout: async () => {
        const { layout, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/applyAutoLayout');

        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } = await d3LayoutService.layoutAllTrees(
            nodes,
            edges,
            layout
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
        const { updateNodeDirection } = get();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        set({ layout: direction }, false, 'mindmap-layout/onLayoutChange');
        updateNodeDirection(direction);
        pushToUndoStack();
      },

      // ===== New Layout Type Methods =====

      layoutAllTreesWithType: async (nodes, edges, layoutType) => {
        // Use strategy factory to layout with new layout types
        const result = await layoutStrategyFactory.layoutAllTrees(
          layoutType,
          nodes,
          edges,
          DEFAULT_LAYOUT_OPTIONS
        );
        return result;
      },

      updateLayoutWithType: async (layoutType) => {
        const { layoutType: currentLayoutType, animateNodesToPositions } = get();
        const nodes = useCoreStore.getState().nodes;
        const edges = useCoreStore.getState().edges;
        const setEdges = useCoreStore.getState().setEdges;
        const setNodes = useCoreStore.getState().setNodes;

        const targetLayoutType = layoutType || currentLayoutType;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateLayoutWithType');

        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutStrategyFactory.layoutAllTrees(
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
