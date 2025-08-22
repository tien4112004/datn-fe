import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNodeOperationsStore } from '../nodeOperation';
import { useCoreStore } from '../core';
import { useUndoRedoStore } from '../undoredo';
import { MINDMAP_TYPES, PATH_TYPES, SIDE, DRAGHANDLE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';

// Mock external dependencies
vi.mock('../core', () => ({
  useCoreStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../undoredo', () => ({
  useUndoRedoStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/shared/lib/utils', () => ({
  generateId: vi.fn(() => `mock-id-${Math.random()}`),
}));

vi.mock('../../services/utils', () => ({
  getRootNodeOfSubtree: vi.fn(),
  getAllDescendantNodes: vi.fn(),
}));

describe('useNodeOperationsStore', () => {
  let mockCoreState: any;
  let mockUndoRedoState: any;

  beforeEach(() => {
    // Reset store state
    useNodeOperationsStore.setState({
      nodesToBeDeleted: new Set<string>(),
    });

    // Mock core store methods
    mockCoreState = {
      nodes: [],
      edges: [],
      setNodes: vi.fn(),
      setEdges: vi.fn(),
    };

    // Mock undo/redo store methods
    mockUndoRedoState = {
      prepareToPushUndo: vi.fn(),
      pushToUndoStack: vi.fn(),
    };

    vi.mocked(useCoreStore.getState).mockReturnValue(mockCoreState);
    vi.mocked(useUndoRedoStore.getState).mockReturnValue(mockUndoRedoState);

    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty nodesToBeDeleted set', () => {
      const state = useNodeOperationsStore.getState();
      expect(state.nodesToBeDeleted).toEqual(new Set<string>());
    });
  });

  describe('addNode', () => {
    it('should create a new root node and add it to nodes', () => {
      const mockNodes: MindMapNode[] = [];
      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const state = useNodeOperationsStore.getState();
      state.addNode();

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(expect.any(Function));

      // Test the updater function
      const updateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const result = updateFunction(mockNodes);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: MINDMAP_TYPES.ROOT_NODE,
        data: {
          level: 0,
          content: expect.stringContaining('New Node'),
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      });
    });

    it('should generate unique positions for new nodes', () => {
      const mockNodes: MindMapNode[] = [];
      mockCoreState.nodes = mockNodes;

      const state = useNodeOperationsStore.getState();
      state.addNode();

      const updateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const result = updateFunction(mockNodes);

      expect(result[0].position.x).toBeGreaterThan(0);
      expect(result[0].position.y).toBeGreaterThan(0);
    });
  });

  describe('addChildNode', () => {
    it('should create a child node with correct properties', async () => {
      const parentNode: Partial<MindMapNode> = {
        id: 'parent-1',
        data: {
          level: 0,
          content: 'Parent',
          side: SIDE.MID,
          isCollapsed: false,
        },
      };

      const position = { x: 100, y: 100 };
      const side = SIDE.LEFT;

      const mockNodes: MindMapNode[] = [];
      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const { getRootNodeOfSubtree } = await import('../../services/utils');
      vi.mocked(getRootNodeOfSubtree).mockReturnValue({
        id: 'root-1',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: 'Root',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      });

      const state = useNodeOperationsStore.getState();
      state.addChildNode(parentNode, position, side);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test node creation
      const nodeUpdateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const nodeResult = nodeUpdateFunction(mockNodes);

      expect(nodeResult).toHaveLength(1);
      expect(nodeResult[0]).toMatchObject({
        type: MINDMAP_TYPES.TEXT_NODE,
        data: {
          level: 1,
          parentId: 'parent-1',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
        dragHandle: DRAGHANDLE.SELECTOR,
        position,
      });

      // Test edge creation
      const edgeUpdateFunction = mockCoreState.setEdges.mock.calls[0][0];
      const edgeResult = edgeUpdateFunction(mockEdges);

      expect(edgeResult).toHaveLength(1);
      expect(edgeResult[0]).toMatchObject({
        source: 'parent-1',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'first-source-parent-1',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
          pathType: expect.any(String),
        },
      });
    });

    it('should create shape node with correct properties', () => {
      const parentNode: Partial<MindMapNode> = {
        id: 'parent-1',
        data: { level: 0 },
      } as MindMapNode;

      const position = { x: 100, y: 100 };
      const side = SIDE.RIGHT;
      const nodeType = MINDMAP_TYPES.SHAPE_NODE;

      const state = useNodeOperationsStore.getState();
      state.addChildNode(parentNode, position, side, nodeType);

      const nodeUpdateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const nodeResult = nodeUpdateFunction([]);

      expect(nodeResult[0]).toMatchObject({
        type: MINDMAP_TYPES.SHAPE_NODE,
        data: {
          shape: 'rectangle',
          width: 120,
          height: 60,
        },
      });
    });

    it('should create image node with correct properties', () => {
      const parentNode: Partial<MindMapNode> = {
        id: 'parent-1',
        data: { level: 0 },
      } as MindMapNode;

      const position = { x: 100, y: 100 };
      const side = SIDE.RIGHT;
      const nodeType = MINDMAP_TYPES.IMAGE_NODE;

      const state = useNodeOperationsStore.getState();
      state.addChildNode(parentNode, position, side, nodeType);

      const nodeUpdateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const nodeResult = nodeUpdateFunction([]);

      expect(nodeResult[0]).toMatchObject({
        type: MINDMAP_TYPES.IMAGE_NODE,
        data: {
          width: 250,
          height: 180,
          alt: 'Image',
        },
      });
    });
  });

  describe('updateNodeData', () => {
    it('should update node data without undo', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Original Content',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      mockCoreState.nodes = mockNodes;

      const updates = { content: 'Updated Content' };
      const state = useNodeOperationsStore.getState();
      state.updateNodeData('node-1', updates);

      expect(mockCoreState.setNodes).toHaveBeenCalled();

      const updateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const result = updateFunction(mockNodes);

      expect(result[0].data.content).toBe('Updated Content');
      expect(result[0].data.level).toBe(1); // Other properties preserved
    });

    it('should not modify nodes that do not match the target id', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Node 1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'node-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Node 2',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      const updates = { content: 'Updated Content' };
      const state = useNodeOperationsStore.getState();
      state.updateNodeData('node-1', updates);

      const updateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const result = updateFunction(mockNodes);

      expect(result[0].data.content).toBe('Updated Content');
      expect(result[1].data.content).toBe('Node 2'); // Unchanged
    });
  });

  describe('updateNodeDataWithUndo', () => {
    it('should update node data and save undo state', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Original Content',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const updates = { content: 'Updated Content' };
      const state = useNodeOperationsStore.getState();
      state.updateNodeDataWithUndo('node-1', updates);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalled();
    });
  });

  describe('markNodeForDeletion', () => {
    it('should mark node and descendants for deletion', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Parent',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 2,
            content: 'Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'parent-1',
          target: 'child-1',
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

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 2,
            content: 'Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ]);

      const state = useNodeOperationsStore.getState();
      state.markNodeForDeletion('parent-1');

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();

      // Check that nodesToBeDeleted is updated
      const updatedState = useNodeOperationsStore.getState();
      expect(updatedState.nodesToBeDeleted).toEqual(new Set(['parent-1', 'child-1']));

      // Check that nodes are marked with isDeleting flag
      expect(mockCoreState.setNodes).toHaveBeenCalled();
      const nodeUpdateFunction = mockCoreState.setNodes.mock.calls[0][0];
      const nodeResult = nodeUpdateFunction(mockNodes);

      expect(nodeResult[0].data.isDeleting).toBe(true);
      expect(nodeResult[1].data.isDeleting).toBe(true);

      // Check that edges are marked with isDeleting flag
      expect(mockCoreState.setEdges).toHaveBeenCalled();
      const edgeUpdateFunction = mockCoreState.setEdges.mock.calls[0][0];
      const edgeResult = edgeUpdateFunction(mockEdges);

      expect(edgeResult[0].data.isDeleting).toBe(true);
    });
  });

  describe('finalizeNodeDeletion', () => {
    it('should remove marked nodes and edges', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'keep-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: { level: 1, content: 'Keep', side: SIDE.LEFT, isCollapsed: false },
        },
        {
          id: 'delete-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 1, content: 'Delete', side: SIDE.RIGHT, isCollapsed: false },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'keep-edge',
          source: 'keep-1',
          target: 'other',
          type: MINDMAP_TYPES.EDGE,
          data: { strokeColor: 'var(--primary)', strokeWidth: 2, pathType: PATH_TYPES.SMOOTHSTEP },
        },
        {
          id: 'delete-edge',
          source: 'delete-1',
          target: 'other',
          type: MINDMAP_TYPES.EDGE,
          data: { strokeColor: 'var(--primary)', strokeWidth: 2, pathType: PATH_TYPES.SMOOTHSTEP },
        },
      ];

      // Set nodes to be deleted
      useNodeOperationsStore.setState({
        nodesToBeDeleted: new Set(['delete-1']),
      });

      const state = useNodeOperationsStore.getState();
      state.finalizeNodeDeletion('delete-1');

      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test node filtering
      const nodeFilterFunction = mockCoreState.setNodes.mock.calls[0][0];
      const nodeResult = nodeFilterFunction(mockNodes);
      expect(nodeResult).toHaveLength(1);
      expect(nodeResult[0].id).toBe('keep-1');

      // Test edge filtering
      const edgeFilterFunction = mockCoreState.setEdges.mock.calls[0][0];
      const edgeResult = edgeFilterFunction(mockEdges);
      expect(edgeResult).toHaveLength(1);
      expect(edgeResult[0].id).toBe('keep-edge');

      // Check that nodesToBeDeleted is cleared
      const updatedState = useNodeOperationsStore.getState();
      expect(updatedState.nodesToBeDeleted).toEqual(new Set());
    });

    it('should handle empty nodesToBeDeleted gracefully', () => {
      useNodeOperationsStore.setState({
        nodesToBeDeleted: new Set(),
      });

      const state = useNodeOperationsStore.getState();
      state.finalizeNodeDeletion('delete-1');

      expect(mockCoreState.setNodes).not.toHaveBeenCalled();
      expect(mockCoreState.setEdges).not.toHaveBeenCalled();
    });
  });

  describe('deleteSelectedNodes', () => {
    it('should mark all selected nodes for deletion', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          selected: true,
          data: { level: 1, content: 'Selected', side: SIDE.LEFT, isCollapsed: false },
        },
        {
          id: 'node-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          selected: false,
          data: { level: 1, content: 'Not Selected', side: SIDE.RIGHT, isCollapsed: false },
        },
        {
          id: 'node-3',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 200, y: 200 },
          selected: true,
          data: { level: 1, content: 'Also Selected', side: SIDE.LEFT, isCollapsed: false },
        },
      ];

      mockCoreState.nodes = mockNodes;

      const markNodeForDeletionSpy = vi.spyOn(useNodeOperationsStore.getState(), 'markNodeForDeletion');

      const state = useNodeOperationsStore.getState();
      state.deleteSelectedNodes();

      expect(markNodeForDeletionSpy).toHaveBeenCalledTimes(2);
      expect(markNodeForDeletionSpy).toHaveBeenCalledWith('node-1');
      expect(markNodeForDeletionSpy).toHaveBeenCalledWith('node-3');
    });

    it('should handle no selected nodes gracefully', () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          selected: false,
          data: { level: 1, content: 'Not Selected', side: SIDE.LEFT, isCollapsed: false },
        },
      ];

      mockCoreState.nodes = mockNodes;

      const markNodeForDeletionSpy = vi.spyOn(useNodeOperationsStore.getState(), 'markNodeForDeletion');

      const state = useNodeOperationsStore.getState();
      state.deleteSelectedNodes();

      expect(markNodeForDeletionSpy).not.toHaveBeenCalled();
    });
  });
});
