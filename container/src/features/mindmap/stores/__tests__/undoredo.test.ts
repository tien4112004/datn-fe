import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMindmapStore } from '../index';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import { Deque } from '@datastructures-js/deque';

// Mock external dependencies
vi.mock('@datastructures-js/deque', () => ({
  Deque: vi.fn(() => ({
    isEmpty: vi.fn(),
    size: vi.fn(),
    pushBack: vi.fn(),
    popBack: vi.fn(),
    popFront: vi.fn(),
    clear: vi.fn(),
  })),
}));

describe('undoredoSlice', () => {
  let mockUndoStack: any;
  let mockRedoStack: any;

  beforeEach(() => {
    // Create mock stacks
    mockUndoStack = {
      isEmpty: vi.fn(),
      size: vi.fn(),
      pushBack: vi.fn(),
      popBack: vi.fn(),
      popFront: vi.fn(),
      clear: vi.fn(),
    };

    mockRedoStack = {
      isEmpty: vi.fn(),
      size: vi.fn(),
      pushBack: vi.fn(),
      popBack: vi.fn(),
      popFront: vi.fn(),
      clear: vi.fn(),
    };

    // Mock Deque constructor to return our mocks
    vi.mocked(Deque).mockImplementation(() => {
      // Alternate between undo and redo stack mocks
      const callCount = vi.mocked(Deque).mock.calls.length;
      return callCount % 2 === 1 ? mockUndoStack : mockRedoStack;
    });

    // Reset store state
    useMindmapStore.setState({
      nodes: [],
      edges: [],
      undoStack: mockUndoStack,
      redoStack: mockRedoStack,
      tempNodes: undefined,
      tempEdges: undefined,
    });

    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty stacks and undefined temp state', () => {
      const state = useMindmapStore.getState();

      expect(state.undoStack).toBeDefined();
      expect(state.redoStack).toBeDefined();
      expect(state.tempNodes).toBeUndefined();
      expect(state.tempEdges).toBeUndefined();
    });
  });

  describe('prepareToPushUndo', () => {
    it('should capture current state from mindmap store', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Test Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
      ];

      useMindmapStore.setState({
        nodes: mockNodes,
        edges: mockEdges,
      });

      const state = useMindmapStore.getState();
      state.prepareToPushUndo();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.tempNodes).toEqual(mockNodes);
      expect(updatedState.tempEdges).toEqual(mockEdges);
    });

    it('should create deep copies of nodes and edges', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Test Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      useMindmapStore.setState({
        nodes: mockNodes,
        edges: [],
      });

      const state = useMindmapStore.getState();
      state.prepareToPushUndo();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.tempNodes).not.toBe(mockNodes); // Should be different references
      expect(updatedState.tempNodes).toEqual(mockNodes); // But same content
    });

    it('should handle empty nodes and edges arrays', () => {
      useMindmapStore.setState({
        nodes: [],
        edges: [],
      });

      const state = useMindmapStore.getState();
      state.prepareToPushUndo();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.tempNodes).toEqual([]);
      expect(updatedState.tempEdges).toEqual([]);
    });
  });

  describe('pushToUndoStack', () => {
    beforeEach(() => {
      // Set up temp state
      const mockNodes: MindMapNode[] = [
        {
          id: 'temp-node',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Temp Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'temp-edge',
          source: 'node-1',
          target: 'node-2',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
      ];

      useMindmapStore.setState({
        tempNodes: mockNodes,
        tempEdges: mockEdges,
      });
    });

    it('should push temp state to undo stack', () => {
      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      expect(mockUndoStack.pushBack).toHaveBeenCalledWith([state.tempNodes, state.tempEdges]);
    });

    it('should clear redo stack when pushing to undo', () => {
      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      expect(mockRedoStack.clear).toHaveBeenCalled();
    });

    it('should clear temp state after pushing', () => {
      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.tempNodes).toBeUndefined();
      expect(updatedState.tempEdges).toBeUndefined();
    });

    it('should limit stack size to 50 items', () => {
      mockUndoStack.size.mockReturnValue(50);

      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      expect(mockUndoStack.popFront).toHaveBeenCalled();
      expect(mockUndoStack.pushBack).toHaveBeenCalled();
    });

    it('should not limit stack if under 50 items', () => {
      mockUndoStack.size.mockReturnValue(30);

      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      expect(mockUndoStack.popFront).not.toHaveBeenCalled();
      expect(mockUndoStack.pushBack).toHaveBeenCalled();
    });

    it('should handle missing temp state gracefully', () => {
      useMindmapStore.setState({
        tempNodes: undefined,
        tempEdges: undefined,
      });

      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      expect(mockUndoStack.pushBack).not.toHaveBeenCalled();
      expect(mockRedoStack.clear).not.toHaveBeenCalled();
    });

    it('should handle partial temp state gracefully', () => {
      useMindmapStore.setState({
        tempNodes: [],
        tempEdges: undefined,
      });

      const state = useMindmapStore.getState();
      state.pushToUndoStack();

      expect(mockUndoStack.pushBack).not.toHaveBeenCalled();
    });
  });

  describe('undo', () => {
    const mockPreviousNodes: MindMapNode[] = [
      {
        id: 'prev-node',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 1,
          content: 'Previous Node',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
      },
    ];

    const mockPreviousEdges: MindMapEdge[] = [
      {
        id: 'prev-edge',
        source: 'prev-node',
        target: 'node-2',
        type: MINDMAP_TYPES.EDGE,
        data: {
          strokeColor: 'var(--secondary)',
          strokeWidth: 1,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      },
    ];

    it('should restore previous state when undo stack has items', () => {
      const currentNodes: MindMapNode[] = [
        {
          id: 'current-node',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Current Node',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      const currentEdges: MindMapEdge[] = [];

      useMindmapStore.setState({
        nodes: currentNodes,
        edges: currentEdges,
      });

      mockUndoStack.isEmpty.mockReturnValue(false);
      mockUndoStack.popBack.mockReturnValue([mockPreviousNodes, mockPreviousEdges]);

      const state = useMindmapStore.getState();
      state.undo();

      expect(mockUndoStack.popBack).toHaveBeenCalled();
      expect(mockRedoStack.pushBack).toHaveBeenCalledWith([currentNodes, currentEdges]);

      // Check that the store was updated with previous state
      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes).toEqual(mockPreviousNodes);
      expect(updatedState.edges).toEqual(mockPreviousEdges);
    });

    it('should not do anything when undo stack is empty', () => {
      const initialState = useMindmapStore.getState();
      const initialNodes = initialState.nodes;
      const initialEdges = initialState.edges;

      mockUndoStack.isEmpty.mockReturnValue(true);

      const state = useMindmapStore.getState();
      state.undo();

      expect(mockUndoStack.popBack).not.toHaveBeenCalled();
      expect(mockRedoStack.pushBack).not.toHaveBeenCalled();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes).toEqual(initialNodes);
      expect(updatedState.edges).toEqual(initialEdges);
    });

    it('should handle undefined previous stage gracefully', () => {
      mockUndoStack.isEmpty.mockReturnValue(false);
      mockUndoStack.popBack.mockReturnValue(undefined);

      const state = useMindmapStore.getState();
      state.undo();

      expect(mockUndoStack.popBack).toHaveBeenCalled();
      expect(mockRedoStack.pushBack).not.toHaveBeenCalled();
    });
  });

  describe('redo', () => {
    const mockNextNodes: MindMapNode[] = [
      {
        id: 'next-node',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 200, y: 200 },
        data: {
          level: 1,
          content: 'Next Node',
          side: SIDE.RIGHT,
          isCollapsed: false,
        },
      },
    ];

    const mockNextEdges: MindMapEdge[] = [
      {
        id: 'next-edge',
        source: 'next-node',
        target: 'node-3',
        type: MINDMAP_TYPES.EDGE,
        data: {
          strokeColor: 'var(--accent)',
          strokeWidth: 3,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      },
    ];

    it('should restore next state when redo stack has items', () => {
      const currentNodes: MindMapNode[] = [
        {
          id: 'current-node',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Current Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const currentEdges: MindMapEdge[] = [];

      useMindmapStore.setState({
        nodes: currentNodes,
        edges: currentEdges,
      });

      mockRedoStack.isEmpty.mockReturnValue(false);
      mockRedoStack.popBack.mockReturnValue([mockNextNodes, mockNextEdges]);

      const state = useMindmapStore.getState();
      state.redo();

      expect(mockRedoStack.popBack).toHaveBeenCalled();
      expect(mockUndoStack.pushBack).toHaveBeenCalledWith([currentNodes, currentEdges]);

      // Check that the store was updated with next state
      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes).toEqual(mockNextNodes);
      expect(updatedState.edges).toEqual(mockNextEdges);
    });

    it('should not do anything when redo stack is empty', () => {
      const initialState = useMindmapStore.getState();
      const initialNodes = initialState.nodes;
      const initialEdges = initialState.edges;

      mockRedoStack.isEmpty.mockReturnValue(true);

      const state = useMindmapStore.getState();
      state.redo();

      expect(mockRedoStack.popBack).not.toHaveBeenCalled();
      expect(mockUndoStack.pushBack).not.toHaveBeenCalled();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes).toEqual(initialNodes);
      expect(updatedState.edges).toEqual(initialEdges);
    });

    it('should handle undefined next stage gracefully', () => {
      mockRedoStack.isEmpty.mockReturnValue(false);
      mockRedoStack.popBack.mockReturnValue(undefined);

      const state = useMindmapStore.getState();
      state.redo();

      expect(mockRedoStack.popBack).toHaveBeenCalled();
      expect(mockUndoStack.pushBack).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle full undo/redo cycle', () => {
      const initialNodes: MindMapNode[] = [
        {
          id: 'initial-node',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Initial Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const modifiedNodes: MindMapNode[] = [
        {
          id: 'modified-node',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Modified Node',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      // Step 1: Prepare and push initial state
      useMindmapStore.setState({ nodes: initialNodes, edges: [] });
      let state = useMindmapStore.getState();
      state.prepareToPushUndo();
      state.pushToUndoStack();

      // Step 2: Change state and prepare/push again
      useMindmapStore.setState({ nodes: modifiedNodes });
      state = useMindmapStore.getState();
      state.prepareToPushUndo();
      state.pushToUndoStack();

      // Step 3: Undo should restore initial state
      mockUndoStack.isEmpty.mockReturnValue(false);
      mockUndoStack.popBack.mockReturnValue([initialNodes, []]);
      state = useMindmapStore.getState();
      state.undo();

      const undoState = useMindmapStore.getState();
      expect(undoState.nodes).toEqual(initialNodes);

      // Step 4: Redo should restore modified state
      mockRedoStack.isEmpty.mockReturnValue(false);
      mockRedoStack.popBack.mockReturnValue([modifiedNodes, []]);
      state = useMindmapStore.getState();
      state.redo();

      const redoState = useMindmapStore.getState();
      expect(redoState.nodes).toEqual(modifiedNodes);
    });

    it('should handle multiple sequential operations', () => {
      const states = [
        { nodes: [{ id: 'state1' }], edges: [] },
        { nodes: [{ id: 'state2' }], edges: [] },
        { nodes: [{ id: 'state3' }], edges: [] },
      ];

      // Push multiple states
      states.forEach((stateData) => {
        useMindmapStore.setState({
          nodes: stateData.nodes as MindMapNode[],
          edges: stateData.edges,
        });
        const state = useMindmapStore.getState();
        state.prepareToPushUndo();
        state.pushToUndoStack();
      });

      expect(mockUndoStack.pushBack).toHaveBeenCalledTimes(3);
      expect(mockRedoStack.clear).toHaveBeenCalledTimes(3);
    });

    it('should handle stack overflow correctly', () => {
      // Mock stack size to simulate overflow
      mockUndoStack.size.mockReturnValue(50);

      const state = useMindmapStore.getState();
      useMindmapStore.setState({
        tempNodes: [],
        tempEdges: [],
      });

      state.pushToUndoStack();

      expect(mockUndoStack.popFront).toHaveBeenCalled();
      expect(mockUndoStack.pushBack).toHaveBeenCalled();
    });

    it('should clear redo stack on new operation after undo', () => {
      // Simulate having items in both stacks
      mockUndoStack.isEmpty.mockReturnValue(false);
      mockRedoStack.isEmpty.mockReturnValue(false);

      // Perform undo
      mockUndoStack.popBack.mockReturnValue([[], []]);
      const state = useMindmapStore.getState();
      state.undo();

      // Then perform new operation
      useMindmapStore.setState({
        tempNodes: [],
        tempEdges: [],
      });
      state.pushToUndoStack();

      expect(mockRedoStack.clear).toHaveBeenCalled();
    });
  });
});
