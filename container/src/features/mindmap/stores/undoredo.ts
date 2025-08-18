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
  pushToUndoStack: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
}

export const useUndoRedoStore = create<UndoRedoState>()(
  devtools((_, get) => ({
    undoStack: new Deque(),
    redoStack: new Deque(),

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

    pushToUndoStack: (nodes: MindMapNode[], edges: MindMapEdge[]) => {
      const undoStack = get().undoStack;
      if (undoStack.size() >= 50) {
        undoStack.popFront(); // Limit stack size to 50
      }
      undoStack.pushBack([nodes, edges]);
      get().redoStack.clear();
    },
  }))
);
