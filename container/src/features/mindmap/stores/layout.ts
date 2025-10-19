import { create } from 'zustand';
import * as d3 from 'd3';
import type { MindMapEdge, MindMapNode, Direction } from '../types';
import { useCoreStore } from './core';
import { devtools } from 'zustand/middleware';
import { d3LayoutService } from '../services/D3LayoutService';
import { useUndoRedoStore } from './undoredo';

interface AnimationData {
  id: string;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  deltaX: number;
  deltaY: number;
}

interface LayoutState {
  layout: Direction;
  isLayouting: boolean;
  isAnimating: boolean;
  animationTimer: d3.Timer | null;
  animationData: AnimationData[];
  setLayout: (direction: Direction) => void;
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
  animateNodesToPositions: (
    targetPositions: Record<string, { x: number; y: number }>,
    duration?: number
  ) => void;
  updateLayout: (direction?: Direction, updateNodeInternals?: (nodeId: string) => void) => void;
  updateSubtreeLayout: (
    nodeId: string,
    direction: Direction,
    updateNodeInternals?: (nodeId: string) => void
  ) => void;
  onLayoutChange: (direction: Direction, updateNodeInternals?: (nodeId: string) => void) => void;
}

const ANIMATION_DURATION = 800;

export const useLayoutStore = create<LayoutState>()(
  devtools(
    (set, get) => ({
      layout: 'horizontal',
      isAnimating: false,
      animationTimer: null,
      animationData: [],

      setLayout: (direction) => set({ layout: direction }, false, 'mindmap-layout/setLayout'),
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

      updateLayout: async (direction, updateNodeInternals) => {
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

          // Update node internals BEFORE animation to ensure handles are positioned correctly
          if (updateNodeInternals) {
            layoutedNodes.forEach((node) => {
              updateNodeInternals(node.id);
            });
          }

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

      updateSubtreeLayout: async (nodeId: string, direction: Direction, updateNodeInternals) => {
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

          // Update node internals BEFORE animation to ensure handles are positioned correctly
          if (updateNodeInternals) {
            layoutedNodes.forEach((node) => {
              updateNodeInternals(node.id);
            });
          }

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

      onLayoutChange: (direction, updateNodeInternals) => {
        const { updateLayout } = get();
        const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
        prepareToPushUndo();

        set({ layout: direction }, false, 'mindmap-layout/onLayoutChange');
        updateLayout(direction, updateNodeInternals);
        pushToUndoStack();
      },
    }),
    { name: 'LayoutStore' }
  )
);
