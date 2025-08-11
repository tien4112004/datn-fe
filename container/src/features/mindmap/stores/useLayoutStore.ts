import { create } from 'zustand';
import ELK from 'elkjs/lib/elk.bundled.js';
import * as d3 from 'd3';
import type { MindMapNode, MindMapEdge } from '../types';
import { DIRECTION, type Direction } from '../constants';
import { useMindmapStore } from './useMindmapStore';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';

const elk = new ELK();

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
  getLayoutedElements: (
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
            deltaX: (target?.x || node.position.x) - node.position.x,
            deltaY: (target?.y || node.position.y) - node.position.y,
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

      getLayoutedElements: async (nodes, edges, direction) => {
        if (nodes.length === 0 || direction === DIRECTION.NONE) {
          return { nodes, edges };
        }

        try {
          // Configure ELK options based on direction
          const isHorizontal = direction === DIRECTION.HORIZONTAL;

          const graph = {
            id: 'root',
            layoutOptions: {
              'elk.algorithm': 'layered',
              'elk.direction': 'RIGHT',
              'elk.spacing.nodeNode': '80',
              'elk.layered.spacing.nodeNodeBetweenLayers': '100',
              'elk.spacing.componentComponent': '50',
              'elk.alignment': 'CENTER',
              'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
              'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
              'elk.layered.cycleBreaking.strategy': 'GREEDY',
            },
            children: nodes.map((node: MindMapNode) => ({
              id: node.id,
              // Adjust handle positions based on layout direction
              targetPosition: isHorizontal ? 'left' : 'top',
              sourcePosition: isHorizontal ? 'right' : 'bottom',
              // Use measured dimensions or fallback values
              width: node.measured?.width || 220,
              height: node.measured?.height || 40,
              layoutOptions: {
                'elk.algorithm': 'mrtree',
                'elk.direction': 'RIGHT',
                'elk.mrtree.searchOrder': 'BFS',
                'elk.spacing.nodeNode': '40',
                'elk.mrtree.weighting': 'MODEL_ORDER',
              },
            })),
            edges: edges.map((edge: MindMapEdge) => ({
              id: edge.id,
              sources: [edge.source],
              targets: [edge.target],
            })),
          };

          const layoutedGraph = await elk.layout(graph);

          const layoutedNodes =
            layoutedGraph.children?.map((layoutedNode: any) => {
              const originalNode = nodes.find((n) => n.id === layoutedNode.id);
              return {
                ...originalNode,
                position: { x: layoutedNode.x, y: layoutedNode.y },
                targetPosition: layoutedNode.targetPosition,
                sourcePosition: layoutedNode.sourcePosition,
              };
            }) || nodes;

          return {
            nodes: layoutedNodes,
            edges,
          };
        } catch (error) {
          console.warn('ELK layout calculation failed:', error);
          return { nodes, edges };
        }
      },

      updateLayout: async (direction) => {
        const { getLayoutedElements, layout, animateNodesToPositions } = get();
        const nodes = useMindmapStore.getState().nodes;
        const edges = useMindmapStore.getState().edges;
        const setEdges = useMindmapStore.getState().setEdges;

        const layoutDirection = direction || layout;

        if (!nodes?.length || !edges) return;

        set({ isLayouting: true }, false, 'mindmap-layout/updateLayout');

        try {
          // Calculate new positions using async ELK layout
          const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
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
