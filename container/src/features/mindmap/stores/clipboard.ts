import { create } from 'zustand';
import type { MindMapNode, MindMapEdge } from '../types';
import { generateId } from '@/shared/lib/utils';
import { devtools } from 'zustand/middleware';
import { useCoreStore } from './core';
import { useUndoRedoStore } from './undoredo';

interface ClipboardState {
  cloningNodes: MindMapNode[];
  cloningEdges: MindMapEdge[];

  mousePosition: { x: number; y: number };
  offset: number;
  dragTargetNodeId: string | null;
  setCloningNodes: (nodes: MindMapNode[]) => void;
  setCloningEdges: (edges: MindMapEdge[]) => void;
  setMousePosition: (position: { x: number; y: number }) => void;
  resetOffset: () => void;
  incrementOffset: () => void;
  copySelectedNodesAndEdges: () => void;
  pasteClonedNodesAndEdges: (
    screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number }
  ) => void;
  setDragTarget: (nodeId: string | null) => void;
}

export const useClipboardStore = create<ClipboardState>()(
  devtools((set, get) => ({
    cloningNodes: [],
    cloningEdges: [],
    mousePosition: { x: 0, y: 0 },
    offset: 0,
    dragTargetNodeId: null,

    setCloningNodes: (nodes) => set({ cloningNodes: nodes }, false, 'mindmap-clip/setCloningNodes'),
    setCloningEdges: (edges) => set({ cloningEdges: edges }, false, 'mindmap-clip/setCloningEdges'),
    setMousePosition: (position) =>
      set({ mousePosition: position, offset: 0 }, false, 'mindmap-clip/setMousePosition'),
    resetOffset: () => set({ offset: 0 }, false, 'mindmap-clip/resetOffset'),
    incrementOffset: () =>
      set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/incrementOffset'),

    copySelectedNodesAndEdges: () => {
      const nodes = useCoreStore.getState().nodes;
      const edges = useCoreStore.getState().edges;
      const selectedNodes = nodes.filter((node) => node.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);

      if (selectedNodes.length === 0) return;

      set(
        {
          cloningNodes: selectedNodes,
          cloningEdges: selectedEdges,
        },
        false,
        'mindmap-clip/copySelectedNodesAndEdges'
      );
    },

    pasteClonedNodesAndEdges: (screenToFlowPosition) => {
      const { cloningNodes, cloningEdges, mousePosition, offset } = get();
      const { setNodes, setEdges, nodes, edges } = useCoreStore.getState();
      const tempNodes = [...nodes];
      const tempEdges = [...edges];

      if (cloningNodes.length === 0) return;

      const rootPosition = cloningNodes[0].position || { x: 0, y: 0 };

      // Generate fresh nodes with new IDs to avoid duplicates
      const freshNodes = cloningNodes.map((node) => ({
        ...node,
        id: generateId(),
        data: {
          ...node.data,
          content: `<p>Cloned: ${node.data.content}</p>`,
          metadata: {
            oldId: node.id,
          },
        },
        selected: false,
      }));

      const freshEdges = cloningEdges.map((edge) => {
        const newSource = freshNodes.find((node) => node.data.metadata?.oldId === edge.source);
        const newTarget = freshNodes.find((node) => node.data.metadata?.oldId === edge.target);

        return {
          ...edge,
          id: generateId(),
          source: newSource ? newSource.id : edge.source,
          target: newTarget ? newTarget.id : edge.target,
          sourceHandle: edge.sourceHandle?.replace(edge.source, newSource?.id || edge.source),
          targetHandle: edge.targetHandle?.replace(edge.target, newTarget?.id || edge.target),
        };
      });

      setNodes((nds: MindMapNode[]) => [
        ...nds.map((node) => ({ ...node, selected: false })),
        ...freshNodes.map((node) => {
          const { x, y } = screenToFlowPosition({
            x: mousePosition.x,
            y: mousePosition.y,
          });

          return {
            ...node,
            position: {
              x: x - rootPosition.x + node.position.x + offset,
              y: y - rootPosition.y + node.position.y + offset,
            },
            selected: true,
          };
        }),
      ]);
      setEdges((eds: MindMapEdge[]) => [...eds, ...freshEdges]);

      const pushUndo = useUndoRedoStore.getState().pushToUndoStack;
      pushUndo(tempNodes, tempEdges);

      // Increment offset for next paste
      set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/pasteClonedNodesAndEdges');
    },

    setDragTarget: (nodeId: string | null) => {
      set({ dragTargetNodeId: nodeId }, false, 'mindmap-clip/setDragTarget');
    },
  }))
);
