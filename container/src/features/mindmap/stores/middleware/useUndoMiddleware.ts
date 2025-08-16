import type { MindMapNode, MindMapEdge } from '../../types';

type UndoableOperation = (...args: any[]) => void;

interface UndoContext {
  getState: () => { nodes: MindMapNode[]; edges: MindMapEdge[] };
  pushToUndoStack: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
}

/**
 * Higher-order function that wraps operations with undo functionality
 *
 * @param operation - The operation to wrap with undo
 * @param operationName - Name for debugging/logging purposes
 * @param getUndoContext - Function to get the current state and undo stack
 * @returns The wrapped operation with undo functionality
 */
export const withUndo = <T extends UndoableOperation>(
  operation: T,
  operationName: string,
  getUndoContext: () => UndoContext
): T => {
  return ((...args: any[]) => {
    try {
      const context = getUndoContext();
      const currentState = context.getState();

      // Push current state to undo stack before executing operation
      context.pushToUndoStack(currentState.nodes, currentState.edges);

      // Execute the original operation
      operation(...args);
    } catch (error) {
      console.error(`Error in undoable operation '${operationName}':`, error);
      throw error;
    }
  }) as T;
};

/**
 * Factory function to create undo-wrapped operations with a specific context
 *
 * @param getUndoContext - Function to get the current state and undo stack
 * @returns Function to wrap operations with undo
 */
export const createUndoWrapper = (getUndoContext: () => UndoContext) => {
  return <T extends UndoableOperation>(operation: T, operationName: string): T => {
    return withUndo(operation, operationName, getUndoContext);
  };
};
