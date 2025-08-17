import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClipboardStore } from '../clipboard';
import { useCoreStore } from '../core';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import { Deque } from '@datastructures-js/deque';

// Mock external dependencies
vi.mock('../core', () => ({
  useCoreStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/shared/lib/utils', () => ({
  generateId: vi.fn(() => `mock-id-${Math.random()}`),
}));

describe('useClipboardStore', () => {
  let mockCoreState: any;

  beforeEach(() => {
    // Reset store state
    useClipboardStore.setState({
      cloningNodes: [],
      cloningEdges: [],
      undoStack: new Deque(),
      redoStack: new Deque(),
      mousePosition: { x: 0, y: 0 },
      offset: 0,
      dragTargetNodeId: null,
    });

    // Mock core store methods
    mockCoreState = {
      nodes: [],
      edges: [],
      setNodes: vi.fn(),
      setEdges: vi.fn(),
    };

    vi.mocked(useCoreStore.getState).mockReturnValue(mockCoreState);

    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty arrays and default values', () => {
      const state = useClipboardStore.getState();
      expect(state.cloningNodes).toEqual([]);
      expect(state.cloningEdges).toEqual([]);
      expect(state.mousePosition).toEqual({ x: 0, y: 0 });
      expect(state.offset).toBe(0);
      expect(state.dragTargetNodeId).toBeNull();
    });
  });

  describe('Basic Setters', () => {
    it('should set cloning nodes', () => {
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

      const state = useClipboardStore.getState();
      state.setCloningNodes(mockNodes);

      expect(useClipboardStore.getState().cloningNodes).toEqual(mockNodes);
    });

    it('should set cloning edges', () => {
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

      const state = useClipboardStore.getState();
      state.setCloningEdges(mockEdges);

      expect(useClipboardStore.getState().cloningEdges).toEqual(mockEdges);
    });

    it('should set mouse position and reset offset', () => {
      // Set initial offset
      useClipboardStore.setState({ offset: 20 });

      const position = { x: 100, y: 200 };
      const state = useClipboardStore.getState();
      state.setMousePosition(position);

      const updatedState = useClipboardStore.getState();
      expect(updatedState.mousePosition).toEqual(position);
      expect(updatedState.offset).toBe(0); // Should reset to 0
    });

    it('should reset offset', () => {
      useClipboardStore.setState({ offset: 40 });

      const state = useClipboardStore.getState();
      state.resetOffset();

      expect(useClipboardStore.getState().offset).toBe(0);
    });

    it('should increment offset', () => {
      const state = useClipboardStore.getState();
      state.incrementOffset();

      expect(useClipboardStore.getState().offset).toBe(20);

      state.incrementOffset();
      expect(useClipboardStore.getState().offset).toBe(40);
    });

    it('should set drag target node id', () => {
      const state = useClipboardStore.getState();
      state.setDragTarget('target-node-1');

      expect(useClipboardStore.getState().dragTargetNodeId).toBe('target-node-1');

      state.setDragTarget(null);
      expect(useClipboardStore.getState().dragTargetNodeId).toBeNull();
    });
  });

  describe('copySelectedNodesAndEdges', () => {
    it('should copy selected nodes and edges', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          selected: true,
          data: {
            level: 1,
            content: 'Selected Node 1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'node-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          selected: false,
          data: {
            level: 1,
            content: 'Unselected Node',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
        {
          id: 'node-3',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 200, y: 200 },
          selected: true,
          data: {
            level: 1,
            content: 'Selected Node 2',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-3',
          selected: true,
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
        {
          id: 'edge-2',
          source: 'node-2',
          target: 'node-3',
          selected: false,
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const state = useClipboardStore.getState();
      state.copySelectedNodesAndEdges();

      const updatedState = useClipboardStore.getState();
      expect(updatedState.cloningNodes).toHaveLength(2);
      expect(updatedState.cloningNodes[0].id).toBe('node-1');
      expect(updatedState.cloningNodes[1].id).toBe('node-3');

      expect(updatedState.cloningEdges).toHaveLength(1);
      expect(updatedState.cloningEdges[0].id).toBe('edge-1');
    });

    it('should not copy anything if no nodes are selected', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          selected: false,
          data: {
            level: 1,
            content: 'Unselected Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = [];

      const state = useClipboardStore.getState();
      state.copySelectedNodesAndEdges();

      const updatedState = useClipboardStore.getState();
      expect(updatedState.cloningNodes).toEqual([]);
      expect(updatedState.cloningEdges).toEqual([]);
    });
  });

  describe('pasteClonedNodesAndEdges', () => {
    beforeEach(() => {
      // Set up cloning data
      const mockCloningNodes: MindMapNode[] = [
        {
          id: 'original-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: '<p>Original Node 1</p>',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'original-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 2,
            content: '<p>Original Node 2</p>',
            parentId: 'original-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const mockCloningEdges: MindMapEdge[] = [
        {
          id: 'original-edge-1',
          source: 'original-1',
          target: 'original-2',
          sourceHandle: 'source-original-1',
          targetHandle: 'target-original-2',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
      ];

      useClipboardStore.setState({
        cloningNodes: mockCloningNodes,
        cloningEdges: mockCloningEdges,
        mousePosition: { x: 200, y: 200 },
        offset: 0,
      });
    });

    it('should paste nodes and edges with new IDs and positions', () => {
      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x + 50, y: pos.y + 50 }));

      const state = useClipboardStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Check that setNodes was called with proper structure
      const setNodesCall = mockCoreState.setNodes.mock.calls[0][0];
      expect(typeof setNodesCall).toBe('function');

      // Test the updater function with mock existing nodes
      const existingNodes: MindMapNode[] = [
        {
          id: 'existing-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 500, y: 500 },
          selected: true,
          data: {
            level: 1,
            content: 'Existing Node',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      const resultNodes = setNodesCall(existingNodes);

      // Should have existing node (deselected) + 2 new nodes (selected)
      expect(resultNodes).toHaveLength(3);

      // Existing node should be deselected
      expect(resultNodes[0].selected).toBe(false);
      expect(resultNodes[0].id).toBe('existing-1');

      // New nodes should be selected and have new IDs
      const newNodes = resultNodes.slice(1);
      expect(newNodes).toHaveLength(2);
      newNodes.forEach((node: any) => {
        expect(node.selected).toBe(true);
        expect(node.id).toMatch(/mock-id-/);
        expect(node.data.content).toMatch(/Cloned:/);
        expect(node.data.metadata?.oldId).toBeTruthy();
      });
    });

    it('should handle edge ID mapping correctly', () => {
      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x, y: pos.y }));

      const state = useClipboardStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Check that setEdges was called with proper structure
      const setEdgesCall = mockCoreState.setEdges.mock.calls[0][0];
      expect(typeof setEdgesCall).toBe('function');

      // Test the updater function
      const existingEdges: MindMapEdge[] = [
        {
          id: 'existing-edge',
          source: 'existing-1',
          target: 'existing-2',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--secondary)',
            strokeWidth: 1,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
      ];

      const resultEdges = setEdgesCall(existingEdges);

      // Should have existing edge + 1 new edge
      expect(resultEdges).toHaveLength(2);

      // New edge should have updated source/target IDs
      const newEdge = resultEdges[1];
      expect(newEdge.id).toMatch(/mock-id-/);
      expect(newEdge.source).toMatch(/mock-id-/);
      expect(newEdge.target).toMatch(/mock-id-/);
    });

    it('should apply position offset correctly', () => {
      useClipboardStore.setState({ offset: 40 });

      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x, y: pos.y }));

      const state = useClipboardStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const setNodesCall = mockCoreState.setNodes.mock.calls[0][0];
      const resultNodes = setNodesCall([]);

      // Check that positions include the offset
      const newNodes = resultNodes;
      expect(newNodes[0].position.x).toBe(200 + 40); // mousePosition.x + offset
      expect(newNodes[0].position.y).toBe(200 + 40); // mousePosition.y + offset
    });

    it('should increment offset after pasting', () => {
      const initialOffset = 20;
      useClipboardStore.setState({ offset: initialOffset });

      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x, y: pos.y }));

      const state = useClipboardStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const updatedState = useClipboardStore.getState();
      expect(updatedState.offset).toBe(initialOffset + 20);
    });

    it('should not paste if no cloning nodes available', () => {
      useClipboardStore.setState({ cloningNodes: [] });

      const mockScreenToFlowPosition = vi.fn();

      const state = useClipboardStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      expect(mockCoreState.setNodes).not.toHaveBeenCalled();
      expect(mockCoreState.setEdges).not.toHaveBeenCalled();
    });
  });

  describe('pushToUndoStack', () => {
    it('should add state to undo stack and clear redo stack', () => {
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

      // Add something to redo stack to test clearing
      const initialState = useClipboardStore.getState();
      initialState.redoStack.pushBack([[], []]);

      const state = useClipboardStore.getState();
      state.pushToUndoStack(mockNodes, mockEdges);

      const updatedState = useClipboardStore.getState();
      expect(updatedState.undoStack.size()).toBe(1);
      expect(updatedState.redoStack.size()).toBe(0); // Should be cleared

      const undoItem = updatedState.undoStack.back();
      expect(undoItem).toEqual([mockNodes, mockEdges]);
    });

    it('should limit undo stack size to 50 items', () => {
      const state = useClipboardStore.getState();

      // Fill stack beyond limit
      for (let i = 0; i < 52; i++) {
        state.pushToUndoStack(
          [
            {
              id: `node-${i}`,
              type: MINDMAP_TYPES.TEXT_NODE,
              position: { x: i, y: i },
              data: { level: 1, content: `Node ${i}`, side: SIDE.LEFT, isCollapsed: false },
            },
          ],
          []
        );
      }

      const updatedState = useClipboardStore.getState();
      expect(updatedState.undoStack.size()).toBe(50);

      // First item should be removed, last item should be node-51
      const lastItem = updatedState.undoStack.back();
      expect(lastItem![0][0].id).toBe('node-51');
    });
  });
});
