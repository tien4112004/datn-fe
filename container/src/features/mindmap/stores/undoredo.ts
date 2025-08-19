import type { MindMapEdge, MindMapNode } from '../types';
import { Deque } from '@datastructures-js/deque';
import { type StateCreator } from 'zustand';
import type { CoreState } from './core';

export interface UndoRedoState {
  undoStack: Deque<[MindMapNode[], MindMapEdge[]]>;
  redoStack: Deque<[MindMapNode[], MindMapEdge[]]>;
  undo: () => void;
  redo: () => void;
  prepareToPushUndo: () => void;
  pushToUndoStack: () => void;
  tempNodes?: MindMapNode[];
  tempEdges?: MindMapEdge[];
}

export const undoRedoSlice: StateCreator<
  CoreState & UndoRedoState,
  [['zustand/devtools', never]],
  [],
  UndoRedoState
> = (set, get) => ({
  undoStack: new Deque(),
  redoStack: new Deque(),

  undo: () => {
    const { undoStack, nodes, edges, setNodes, setEdges } = get();
    if (undoStack.isEmpty()) return;

    const previousStage = undoStack.popBack();
    if (previousStage) {
      const [prevNodes, prevEdges] = previousStage;

      // Push current state to redo stack before changing
      get().redoStack.pushBack([nodes, edges]);

      setNodes(prevNodes);
      setEdges(prevEdges);
    }
  },

  redo: () => {
    const { setNodes, setEdges, edges, nodes, redoStack } = get();
    if (redoStack.isEmpty()) return;

    const nextStage = redoStack.popBack();
    if (nextStage) {
      const [nextNodes, nextEdges] = nextStage;

      // Push current state to undo stack before changing
      get().undoStack.pushBack([nodes, edges]);

      setNodes(nextNodes);
      setEdges(nextEdges);
    }
  },

  prepareToPushUndo: () => {
    const { nodes, edges } = get();
    set({
      tempNodes: [...nodes],
      tempEdges: [...edges],
    });
  },

  pushToUndoStack: () => {
    const undoStack = get().undoStack;
    if (undoStack.size() >= 50) {
      undoStack.popFront(); // Limit stack size to 50
    }
    const { tempNodes, tempEdges } = get();
    if (!tempNodes || !tempEdges) {
      return;
    }

    undoStack.pushBack([tempNodes, tempEdges]);
    get().redoStack.clear();
    set({
      tempNodes: undefined,
      tempEdges: undefined,
    });
  },
});
