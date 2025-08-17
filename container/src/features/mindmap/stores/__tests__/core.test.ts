import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCoreStore } from '../core';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';
import * as reactFlowUtils from '@xyflow/react';

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
  addEdge: vi.fn((edge, edges) => [...edges, edge]),
  applyNodeChanges: vi.fn((_, nodes) => nodes),
  applyEdgeChanges: vi.fn((_, edges) => edges),
}));

// Mock utils
vi.mock('../../services/utils', () => ({
  getRootNodeOfSubtree: vi.fn(),
}));

describe('useCoreStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCoreStore.setState({
      nodes: [],
      edges: [],
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty nodes and edges arrays', () => {
      const state = useCoreStore.getState();
      expect(state.nodes).toEqual([]);
      expect(state.edges).toEqual([]);
    });
  });

  describe('Node and Edge Changes', () => {
    it('should handle node changes', () => {
      const mockChanges = [{ id: 'node-1', type: 'position', position: { x: 100, y: 100 } }];
      const mockApplyNodeChanges = vi.mocked(reactFlowUtils.applyNodeChanges);

      const state = useCoreStore.getState();
      state.onNodesChange(mockChanges);

      expect(mockApplyNodeChanges).toHaveBeenCalledWith(mockChanges, []);
    });

    it('should handle edge changes', () => {
      const mockChanges = [{ id: 'edge-1', type: 'remove' }];
      const mockApplyEdgeChanges = vi.mocked(reactFlowUtils.applyEdgeChanges);

      const state = useCoreStore.getState();
      state.onEdgesChange(mockChanges);

      expect(mockApplyEdgeChanges).toHaveBeenCalledWith(mockChanges, []);
    });

    it('should handle connection with default pathType', async () => {
      const mockConnection = {
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'source-handle',
        targetHandle: 'target-handle',
      };

      const mockAddEdge = vi.mocked(reactFlowUtils.addEdge);
      const { getRootNodeOfSubtree } = await import('../../services/utils');
      vi.mocked(getRootNodeOfSubtree).mockReturnValue(null);

      const state = useCoreStore.getState();
      state.onConnect(mockConnection);

      expect(mockAddEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockConnection,
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        }),
        []
      );
    });

    it('should handle connection and call addEdge', () => {
      const mockConnection = {
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'source-handle',
        targetHandle: 'target-handle',
      };

      const state = useCoreStore.getState();
      state.onConnect(mockConnection);

      expect(vi.mocked(reactFlowUtils.addEdge)).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'node-1',
          target: 'node-2',
          sourceHandle: 'source-handle',
          targetHandle: 'target-handle',
          type: MINDMAP_TYPES.EDGE,
          data: expect.objectContaining({
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: expect.any(String),
          }),
        }),
        []
      );
    });
  });

  describe('Setters', () => {
    it('should set nodes with array', () => {
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

      const state = useCoreStore.getState();
      state.setNodes(mockNodes);

      expect(useCoreStore.getState().nodes).toEqual(mockNodes);
    });

    it('should set nodes with updater function', () => {
      const initialNodes: MindMapNode[] = [
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

      useCoreStore.setState({ nodes: initialNodes });

      const state = useCoreStore.getState();
      state.setNodes((nodes) => [
        ...nodes,
        {
          id: 'node-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Another Node',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ]);

      expect(useCoreStore.getState().nodes).toHaveLength(2);
      expect(useCoreStore.getState().nodes[1].id).toBe('node-2');
    });

    it('should set edges with array', () => {
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

      const state = useCoreStore.getState();
      state.setEdges(mockEdges);

      expect(useCoreStore.getState().edges).toEqual(mockEdges);
    });

    it('should set edges with updater function', () => {
      const initialEdges: MindMapEdge[] = [
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

      useCoreStore.setState({ edges: initialEdges });

      const state = useCoreStore.getState();
      state.setEdges((edges) => [
        ...edges,
        {
          id: 'edge-2',
          source: 'node-2',
          target: 'node-3',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
      ]);

      expect(useCoreStore.getState().edges).toHaveLength(2);
      expect(useCoreStore.getState().edges[1].id).toBe('edge-2');
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Root Node',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
        {
          id: 'node-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Left Child',
            side: SIDE.LEFT,
            parentId: 'node-1',
            isCollapsed: false,
          },
        },
        {
          id: 'node-3',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Right Child',
            side: SIDE.RIGHT,
            parentId: 'node-1',
            isCollapsed: false,
          },
        },
      ];

      useCoreStore.setState({ nodes: mockNodes });
    });

    it('should get node by id', () => {
      const state = useCoreStore.getState();
      const node = state.getNode('node-2');

      expect(node).toBeDefined();
      expect(node?.id).toBe('node-2');
      expect(node?.data.content).toBe('Left Child');
    });

    it('should return undefined for non-existent node', () => {
      const state = useCoreStore.getState();
      const node = state.getNode('non-existent');

      expect(node).toBeUndefined();
    });

    it('should get correct node length', () => {
      const state = useCoreStore.getState();
      const length = state.getNodeLength();

      expect(length).toBe(3);
    });

    it('should check if node has left children', () => {
      const state = useCoreStore.getState();
      const hasLeftChildren = state.hasLeftChildren('node-1');

      expect(hasLeftChildren).toBe(true);
    });

    it('should check if node has right children', () => {
      const state = useCoreStore.getState();
      const hasRightChildren = state.hasRightChildren('node-1');

      expect(hasRightChildren).toBe(true);
    });

    it('should return false for node without left children', () => {
      const state = useCoreStore.getState();
      const hasLeftChildren = state.hasLeftChildren('node-2');

      expect(hasLeftChildren).toBe(false);
    });

    it('should return false for node without right children', () => {
      const state = useCoreStore.getState();
      const hasRightChildren = state.hasRightChildren('node-2');

      expect(hasRightChildren).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Root Node',
            side: SIDE.MID,
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

      useCoreStore.setState({ nodes: mockNodes, edges: mockEdges });
    });

    it('should log data without throwing errors', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const state = useCoreStore.getState();
      expect(() => state.logData()).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Nodes:', expect.any(Array));
      expect(consoleSpy).toHaveBeenCalledWith('Edges:', expect.any(Array));

      consoleSpy.mockRestore();
    });

    it('should sync state with update function', () => {
      const mockUpdateNodeInternals = vi.fn();

      const state = useCoreStore.getState();
      state.syncState(mockUpdateNodeInternals);

      expect(mockUpdateNodeInternals).toHaveBeenCalledWith(['node-1']);
    });

    it('should handle syncState with empty nodes', () => {
      useCoreStore.setState({ nodes: [] });
      const mockUpdateNodeInternals = vi.fn();

      const state = useCoreStore.getState();
      state.syncState(mockUpdateNodeInternals);

      expect(mockUpdateNodeInternals).toHaveBeenCalledWith([]);
    });
  });
});
