import { create } from 'zustand';
import * as d3 from 'd3';
import type { BaseNode, MindMapEdge, MindMapNode } from '../types';
import { type Direction } from '../types/constants';
import { useMindmapStore } from './useMindmapStore';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';
import { d3LayoutService } from '../services/D3LayoutService';

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
  updateLayout: (direction?: Direction) => void;
  updateSubtreeLayout: (nodeId: string, direction: Direction) => void;
  onLayoutChange: (direction: Direction) => void;
}

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
        const nodes = useMindmapStore.getState().nodes;
        const setNodes = useMindmapStore.getState().setNodes;

        if (!nodes?.length) return;

        // Stop existing animation
        if (animationTimer) {
          animationTimer.stop();
        }

        // Store initial positions and calculate deltas
        const animationData = nodes.map((node) => {
          const target = targetPositions[node.id];
          return {
            id: node.id,
            startPos: { ...node.position },
            targetPos: target || node.position,
            deltaX: target.x - (node.position.x ?? 0),
            deltaY: target.y - (node.position.y ?? 0),
          };
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

          setNodes((currentNodes: BaseNode[]) =>
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
        const nodes = useMindmapStore.getState().nodes;
        const edges = useMindmapStore.getState().edges;
        const setEdges = useMindmapStore.getState().setEdges;

        const layoutDirection = direction || layout;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateLayout');

        try {
          // Calculate new positions using async D3 layout
          const { nodes: layoutedNodes, edges: layoutedEdges } = await d3LayoutService.layoutAllTrees(
            nodes,
            edges,
            layoutDirection
          );

          // Update edges immediately
          setEdges([...layoutedEdges]);

          // Create target positions for animation
          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            targetPositions[node.id] = { x: node.position.x, y: node.position.y };
          });

          // Animate nodes to new positions using d3-based animation
          animateNodesToPositions(targetPositions, 800);

          // Remove isLayouting flag after animation completes
          setTimeout(() => {
            set({ isLayouting: false }, false, 'mindmap-layout/updateLayout:animationEnd');
          }, 900);
        } catch (error) {
          console.error('Layout update failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateLayout:error');
        }
      },

      updateSubtreeLayout: async (nodeId: string, direction: Direction) => {
        const { animateNodesToPositions } = get();
        const nodes = useMindmapStore.getState().nodes;
        const edges = useMindmapStore.getState().edges;
        const setEdges = useMindmapStore.getState().setEdges;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateSubtreeLayout');

        try {
          // Find the root node for the subtree
          const rootNode = nodes.find((node) => node.id === nodeId);
          if (!rootNode) {
            console.error('Root node not found for subtree layout');
            set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:error');
            return;
          }

          // Get descendant nodes for this root
          const descendantNodes = d3LayoutService
            .getSubtreeNodes(nodeId, nodes)
            .filter((node) => node.id !== nodeId);

          // Get edges that connect nodes in this subtree
          const subtreeNodeIds = new Set([nodeId, ...descendantNodes.map((n) => n.id)]);
          const subtreeEdges = edges.filter(
            (edge) => subtreeNodeIds.has(edge.source) && subtreeNodeIds.has(edge.target)
          );

          // Calculate new positions for subtree using D3 layout service
          const { nodes: layoutedNodes, edges: layoutedEdges } = await d3LayoutService.layoutSubtree(
            rootNode,
            descendantNodes,
            subtreeEdges,
            direction
          );

          // Update edges immediately
          setEdges([...layoutedEdges]);

          // Create target positions for animation (only for changed nodes)
          const targetPositions: Record<string, { x: number; y: number }> = {};
          layoutedNodes.forEach((node) => {
            const originalNode = nodes.find((n) => n.id === node.id);
            if (
              originalNode &&
              (originalNode.position.x !== node.position.x || originalNode.position.y !== node.position.y)
            ) {
              targetPositions[node.id] = { x: node.position.x, y: node.position.y };
            }
          });

          // Only animate if there are position changes
          if (Object.keys(targetPositions).length > 0) {
            // Animate nodes to new positions using d3-based animation
            animateNodesToPositions(targetPositions, 800);

            // Remove isLayouting flag after animation completes
            setTimeout(() => {
              set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:animationEnd');
            }, 900);
          } else {
            set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:noChanges');
          }
        } catch (error) {
          console.error('Subtree layout update failed:', error);
          set({ isLayouting: false }, false, 'mindmap-layout/updateSubtreeLayout:error');
        }
      },

      layoutAllTrees: async (nodes: MindMapNode[], edges: MindMapEdge[], direction: Direction) => {
        return await d3LayoutService.layoutAllTrees(nodes, edges, direction);
      },

      onLayoutChange: (direction) => {
        const { updateLayout } = get();
        const pushUndo = useClipboardStore.getState().pushToUndoStack;
        pushUndo(useMindmapStore.getState().nodes, useMindmapStore.getState().edges);

        set({ layout: direction }, false, 'mindmap-layout/onLayoutChange');
        updateLayout(direction);
      },
    }),
    { name: 'LayoutStore' }
  )
);
