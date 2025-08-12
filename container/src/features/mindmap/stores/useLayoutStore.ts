import { create } from 'zustand';
import ELK from 'elkjs/lib/elk.bundled.js';
import * as d3 from 'd3';
import type { BaseNode, MindMapEdge } from '../types';
import { type Direction } from '../constants';
import { useMindmapStore } from './useMindmapStore';
import { devtools } from 'zustand/middleware';
import { useClipboardStore } from './useClipboardStore';

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
    nodes: BaseNode[],
    edges: MindMapEdge[],
    direction: Direction
  ) => Promise<{
    nodes: BaseNode[];
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

      /**
       * Logic: Keep Root note as original position.
       * For Level-1 nodes, position them left/right of the root node.
       * For deeper levels, use ELK to layout subtrees with level-1 nodes as roots.
       */
      getLayoutedElements: async (nodes, edges) => {
        const elk = new ELK();

        const HORIZONTAL_SPACING = 250;
        const VERTICAL_SPACING = 125;
        const LEVEL1_OFFSET_X = 300;
        const LEVEL1_OFFSET_Y = 100;

        const rootNode = nodes.find((node) => node.data.level === 0);
        if (!rootNode) {
          return { nodes, edges };
        }

        const level1Nodes = nodes.filter((node) => node.data.level === 1);

        const layoutedNodes: BaseNode[] = [];
        const rootX = rootNode.position?.x ?? 0;
        const rootY = rootNode.position?.y ?? 0;

        layoutedNodes.push({
          ...rootNode,
          position: {
            x: rootX,
            y: rootY,
          },
        });

        const leftLevel1Nodes = level1Nodes.filter((n) => n.data.side === 'left');
        const rightLevel1Nodes = level1Nodes.filter((n) => n.data.side === 'right');

        leftLevel1Nodes.forEach((node, index) => {
          const yOffset = (index - (leftLevel1Nodes.length - 1) / 2) * LEVEL1_OFFSET_Y;
          const targetX = rootX - LEVEL1_OFFSET_X;
          const targetY = rootY + yOffset;
          layoutedNodes.push({
            ...node,
            position: {
              // Position calculation breakdown:
              // 1. Start with targetX (root's X position minus horizontal offset)
              // 2. Subtract half of current node's width to center it horizontally (React Flow uses center point)
              // 3. Add half of root node's width to account for root's center point
              x: targetX - (node.measured?.width ?? 0) / 2 + (rootNode.measured?.width ?? 0) / 2,
              y: targetY - (node.measured?.height ?? 0) / 2 + (rootNode.measured?.height ?? 0) / 2,
            },
          });
        });

        rightLevel1Nodes.forEach((node, index) => {
          const yOffset = (index - (rightLevel1Nodes.length - 1) / 2) * LEVEL1_OFFSET_Y;
          const targetX = rootX + LEVEL1_OFFSET_X;
          const targetY = rootY + yOffset;
          layoutedNodes.push({
            ...node,
            position: {
              x: targetX - (node.measured?.width ?? 0) / 2 + (rootNode.measured?.width ?? 0) / 2,
              y: targetY - (node.measured?.height ?? 0) / 2 + (rootNode.measured?.height ?? 0) / 2,
            },
          });
        });

        // Layout subtrees for each Level-1 node using ELK
        for (const level1Node of level1Nodes) {
          const subtreeNodes = useMindmapStore.getState().getAllDescendantNodes(level1Node.id);

          if (subtreeNodes.length === 0) continue;

          const subtreeNodeIds = new Set([level1Node.id, ...subtreeNodes.map((n) => n.id)]);
          const subtreeEdges = edges.filter(
            (edge) => subtreeNodeIds.has(edge.source) && subtreeNodeIds.has(edge.target)
          );

          const elkNodes = [level1Node, ...subtreeNodes].map((node) => ({
            id: node.id,
            width: node.width ?? 150,
            height: node.height ?? 50,
            properties: {
              level: node.data.level,
            },
          }));

          const elkEdges = subtreeEdges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
          }));

          const layoutDirection = level1Node.data.side === 'left' ? 'LEFT' : 'RIGHT';

          const elkGraph = {
            id: 'root',
            layoutOptions: {
              'elk.algorithm': 'layered',
              'elk.direction': layoutDirection,
              'elk.spacing.nodeNode': VERTICAL_SPACING.toString(),
              'elk.layered.spacing.nodeNodeBetweenLayers': HORIZONTAL_SPACING.toString(),
              'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
              'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
              'elk.layered.nodePlacement.favorStraightEdges': 'true',
              'elk.layered.thoroughness': '10',
            },
            children: elkNodes,
            edges: elkEdges,
          };

          try {
            const layoutedGraph = await elk.layout(elkGraph);

            const level1LayoutedNode = layoutedNodes.find((n) => n.id === level1Node.id);
            if (!level1LayoutedNode) continue;

            const level1BaseX = level1LayoutedNode.position.x;
            const level1BaseY = level1LayoutedNode.position.y;

            const level1ElkNode = layoutedGraph.children?.find((n) => n.id === level1Node.id);
            if (!level1ElkNode) continue;

            const offsetX = level1BaseX - (level1ElkNode.x ?? 0);
            const offsetY = level1BaseY - (level1ElkNode.y ?? 0);

            layoutedGraph.children?.forEach((elkNode) => {
              if (elkNode.id === level1Node.id) return;

              const originalNode = subtreeNodes.find((n) => n.id === elkNode.id);
              if (originalNode) {
                const targetX = (elkNode.x ?? 0) + offsetX;
                const targetY = (elkNode.y ?? 0) + offsetY;
                layoutedNodes.push({
                  ...originalNode,
                  position: {
                    x:
                      targetX - (originalNode.measured?.width ?? 0) / 2 + (rootNode.measured?.width ?? 0) / 2,
                    y:
                      targetY -
                      (originalNode.measured?.height ?? 0) / 2 +
                      (rootNode.measured?.height ?? 0) / 2,
                  },
                });
              }
            });
          } catch (error) {
            console.error('ELK layout error for subtree:', error);
          }
        }

        return {
          nodes: layoutedNodes,
          edges: edges,
        };
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
