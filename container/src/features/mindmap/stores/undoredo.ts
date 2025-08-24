import { devtools } from 'zustand/middleware';
import type { MindMapEdge, MindMapNode } from '../types';
import { Deque } from '@datastructures-js/deque';
import { useCoreStore } from './core';
import { create } from 'zustand';

interface UndoRedoState {
  undoStack: Deque<[MindMapNode[], MindMapEdge[]]>;
  redoStack: Deque<[MindMapNode[], MindMapEdge[]]>;
  undo: () => void;
  redo: () => void;
  tempNodes: MindMapNode[] | null;
  tempEdges: MindMapEdge[] | null;
  prepareToPushUndo: () => void;
  pushToUndoStack: () => void;
}

export const useUndoRedoStore = create<UndoRedoState>()(
  devtools((set, get) => ({
    undoStack: new Deque(),
    redoStack: new Deque(),

    tempNodes: null,
    tempEdges: null,

    undo: () => {
      const undoStack = get().undoStack;
      if (undoStack.isEmpty()) return;

      const setNodes = useCoreStore.getState().setNodes;
      const setEdges = useCoreStore.getState().setEdges;
      const edges = useCoreStore.getState().edges;
      const nodes = useCoreStore.getState().nodes;

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
      const redoStack = get().redoStack;
      if (redoStack.isEmpty()) return;

      const setNodes = useCoreStore.getState().setNodes;
      const setEdges = useCoreStore.getState().setEdges;
      const edges = useCoreStore.getState().edges;
      const nodes = useCoreStore.getState().nodes;

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
      const edges = useCoreStore.getState().edges;
      const nodes = useCoreStore.getState().nodes;
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
        tempNodes: null,
        tempEdges: null,
      });
    },
  }))
);
