import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMindmapStore } from '../index';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';

// Mock external dependencies
vi.mock('@/shared/lib/utils', () => ({
  generateId: vi.fn(() => `mock-id-${Math.random()}`),
}));

// Mock undo/redo methods that are now part of the unified store
const mockUndoRedoMethods = {
  prepareToPushUndo: vi.fn(),
  pushToUndoStack: vi.fn(),
};

describe('clipboardSlice', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMindmapStore.setState({
      nodes: [],
      edges: [],
      cloningNodes: [],
      cloningEdges: [],
      mousePosition: { x: 0, y: 0 },
      offset: 0,
      dragTargetNodeId: null,
      // Mock undo/redo methods
      prepareToPushUndo: mockUndoRedoMethods.prepareToPushUndo,
      pushToUndoStack: mockUndoRedoMethods.pushToUndoStack,
    });

    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty arrays and default values', () => {
      const state = useMindmapStore.getState();
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

      const state = useMindmapStore.getState();
      state.setCloningNodes(mockNodes);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.cloningNodes).toEqual(mockNodes);
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

      const state = useMindmapStore.getState();
      state.setCloningEdges(mockEdges);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.cloningEdges).toEqual(mockEdges);
    });

    it('should set mouse position and reset offset', () => {
      // Set initial offset
      useMindmapStore.setState({ offset: 20 });

      const position = { x: 100, y: 200 };
      const state = useMindmapStore.getState();
      state.setMousePosition(position);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.mousePosition).toEqual(position);
      expect(updatedState.offset).toBe(0); // Should reset to 0
    });

    it('should reset offset', () => {
      useMindmapStore.setState({ offset: 40 });

      const state = useMindmapStore.getState();
      state.resetOffset();

      const updatedState = useMindmapStore.getState();
      expect(updatedState.offset).toBe(0);
    });

    it('should increment offset', () => {
      const state = useMindmapStore.getState();
      state.incrementOffset();

      let updatedState = useMindmapStore.getState();
      expect(updatedState.offset).toBe(20);

      state.incrementOffset();
      updatedState = useMindmapStore.getState();
      expect(updatedState.offset).toBe(40);
    });

    it('should set drag target node id', () => {
      const state = useMindmapStore.getState();
      state.setDragTarget('target-node-1');

      let updatedState = useMindmapStore.getState();
      expect(updatedState.dragTargetNodeId).toBe('target-node-1');

      state.setDragTarget(null);
      updatedState = useMindmapStore.getState();
      expect(updatedState.dragTargetNodeId).toBeNull();
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

      useMindmapStore.setState({
        nodes: mockNodes,
        edges: mockEdges,
      });

      const state = useMindmapStore.getState();
      state.copySelectedNodesAndEdges();

      const updatedState = useMindmapStore.getState();
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

      useMindmapStore.setState({
        nodes: mockNodes,
        edges: [],
      });

      const state = useMindmapStore.getState();
      state.copySelectedNodesAndEdges();

      const updatedState = useMindmapStore.getState();
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

      useMindmapStore.setState({
        cloningNodes: mockCloningNodes,
        cloningEdges: mockCloningEdges,
        mousePosition: { x: 200, y: 200 },
        offset: 0,
      });
    });

    it('should paste nodes and edges with new IDs and positions', () => {
      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x + 50, y: pos.y + 50 }));

      const state = useMindmapStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const updatedState = useMindmapStore.getState();

      // Should have 2 new nodes
      expect(updatedState.nodes).toHaveLength(2);

      // New nodes should have new IDs and be selected
      const newNodes = updatedState.nodes;
      expect(newNodes).toHaveLength(2);
      newNodes.forEach((node: any) => {
        expect(node.selected).toBe(true);
        expect(node.id).toMatch(/mock-id-/);
        expect(node.data.content).toMatch(/Cloned:/);
        expect(node.data.metadata?.oldId).toBeTruthy();
      });

      // Should have 1 new edge
      expect(updatedState.edges).toHaveLength(1);
      const newEdge = updatedState.edges[0];
      expect(newEdge.id).toMatch(/mock-id-/);
      expect(newEdge.source).toMatch(/mock-id-/);
      expect(newEdge.target).toMatch(/mock-id-/);
    });

    it('should handle edge ID mapping correctly', () => {
      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x, y: pos.y }));

      // Set up existing edges
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

      useMindmapStore.setState({ edges: existingEdges });

      const state = useMindmapStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const updatedState = useMindmapStore.getState();

      // Should have existing edge + 1 new edge
      expect(updatedState.edges).toHaveLength(2);

      // New edge should have updated source/target IDs
      const newEdge = updatedState.edges[1];
      expect(newEdge.id).toMatch(/mock-id-/);
      expect(newEdge.source).toMatch(/mock-id-/);
      expect(newEdge.target).toMatch(/mock-id-/);
    });

    it('should apply position offset correctly', () => {
      useMindmapStore.setState({ offset: 40 });

      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x, y: pos.y }));

      const state = useMindmapStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const updatedState = useMindmapStore.getState();

      // Check that positions include the offset
      const newNodes = updatedState.nodes;
      expect(newNodes[0].position.x).toBe(200 + 40); // mousePosition.x + offset
      expect(newNodes[0].position.y).toBe(200 + 40); // mousePosition.y + offset
    });

    it('should increment offset after pasting', () => {
      const initialOffset = 20;
      useMindmapStore.setState({ offset: initialOffset });

      const mockScreenToFlowPosition = vi.fn((pos) => ({ x: pos.x, y: pos.y }));

      const state = useMindmapStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.offset).toBe(initialOffset + 20);
    });

    it('should not paste if no cloning nodes available', () => {
      useMindmapStore.setState({ cloningNodes: [] });

      const mockScreenToFlowPosition = vi.fn();

      const initialState = useMindmapStore.getState();
      const initialNodesLength = initialState.nodes.length;
      const initialEdgesLength = initialState.edges.length;

      const state = useMindmapStore.getState();
      state.pasteClonedNodesAndEdges(mockScreenToFlowPosition);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes).toHaveLength(initialNodesLength);
      expect(updatedState.edges).toHaveLength(initialEdgesLength);
    });
  });
});
