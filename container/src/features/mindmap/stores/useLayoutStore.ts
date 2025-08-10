import { create } from 'zustand';
import dagre from '@dagrejs/dagre';
import type { MindMapNode, MindMapEdge } from '../types';
import { DIRECTION, type Direction } from '../constants';

interface LayoutState {
  layout: Direction;
  isLayouting: boolean;
  setLayout: (direction: Direction) => void;
  setIsLayouting: (isLayouting: boolean) => void;
  getLayoutedElements: (
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    direction: Direction
  ) => {
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  };
  updateLayout: (
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    direction: Direction,
    setNodes: (updater: (nodes: MindMapNode[]) => MindMapNode[]) => void,
    setEdges: (updater: (edges: MindMapEdge[]) => MindMapEdge[]) => void
  ) => void;
  onLayoutChange: (
    direction: Direction,
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    setNodes: (updater: (nodes: MindMapNode[]) => MindMapNode[]) => void,
    setEdges: (updater: (edges: MindMapEdge[]) => MindMapEdge[]) => void
  ) => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layout: 'horizontal',
  isLayouting: false,

  setLayout: (direction) => set({ layout: direction }),
  setIsLayouting: (isLayouting) => set({ isLayouting }),

  getLayoutedElements: (nodes, edges, direction) => {
    if (nodes.length === 0 || direction === DIRECTION.NONE) return { nodes, edges };

    try {
      // Create a new directed graph
      const g = new dagre.graphlib.Graph();

      // Set an object for the graph label
      g.setDefaultEdgeLabel(() => ({}));

      // Configure the graph based on direction
      if (direction === DIRECTION.VERTICAL) {
        g.setGraph({ rankdir: 'TB', ranksep: 120 });
      } else if (direction === DIRECTION.HORIZONTAL) {
        g.setGraph({ rankdir: 'LR', ranksep: 120 });
      } else {
        return { nodes, edges };
      }

      // Add nodes to the graph
      nodes.forEach((node: MindMapNode) => {
        g.setNode(node.id, {
          width: node.measured?.width || 220,
          height: node.measured?.height || 40,
        });
      });

      // Add edges to the graph
      edges.forEach((edge: MindMapEdge) => {
        g.setEdge(edge.source, edge.target);
      });

      // Calculate the layout
      dagre.layout(g, {
        disableOptimalOrderHeuristic: true,
      });

      // Update node positions based on dagre layout
      const layoutedNodes = nodes.map((node: any) => {
        const nodeWithPosition = g.node(node.id);
        return {
          ...node,
          position: {
            // Dagre gives us the center position, adjust to top-left
            x: nodeWithPosition.x - (nodeWithPosition.width || 150) / 2,
            y: nodeWithPosition.y - (nodeWithPosition.height || 40) / 2,
          },
        };
      });

      return {
        nodes: layoutedNodes,
        edges,
      };
    } catch (error) {
      console.warn('Layout calculation failed:', error);
      return { nodes, edges };
    }
  },

  updateLayout: (nodes, edges, direction, setNodes, setEdges) => {
    const { getLayoutedElements } = get();

    if (!nodes?.length || !edges) return;

    set({ isLayouting: true });

    // Calculate new positions
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);

    // Update nodes with smooth transitions using React Flow's animation system
    setNodes(() => [
      ...layoutedNodes.map((layoutedNode) => {
        return {
          ...layoutedNode,
          // Apply smooth transition using React Flow's built-in animation
          style: {
            ...layoutedNode.style,
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
        };
      }),
    ]);
    setEdges(() => [...layoutedEdges]);

    // Remove isLayouting flag after animation completes
    setTimeout(() => {
      set({ isLayouting: false });
      setNodes((nds: MindMapNode[]) =>
        nds.map((node) => ({ ...node, style: { ...node.style, transition: '' } }))
      );
    }, 800);
  },

  onLayoutChange: (direction, nodes, edges, setNodes, setEdges) => {
    const { updateLayout } = get();
    set({ layout: direction });
    updateLayout(nodes, edges, direction, setNodes, setEdges);
  },
}));
