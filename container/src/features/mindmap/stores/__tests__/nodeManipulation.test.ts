import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNodeManipulationStore } from '../nodeManipulation';
import { useCoreStore } from '../core';
import { useUndoRedoStore } from '../undoredo';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
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

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/shared/lib/utils', () => ({
  generateId: vi.fn(() => `mock-id-${Math.random()}`),
}));

vi.mock('../../services/utils', () => ({
  getAllDescendantNodes: vi.fn(),
  getRootNodeOfSubtree: vi.fn(),
}));

describe('useNodeManipulationStore', () => {
  let mockCoreState: any;
  let mockUndoRedoState: any;

  beforeEach(() => {
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

  describe('collapse', () => {
    it('should collapse nodes on the specified side', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Parent',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
        {
          id: 'left-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Left Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'right-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Right Child',
            parentId: 'parent-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'parent-1',
          target: 'left-child',
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
          id: 'left-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Left Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ]);

      const state = useNodeManipulationStore.getState();
      state.collapse('parent-1', SIDE.LEFT);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test node updates - parent should store collapsed children
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'parent-1',
            data: expect.objectContaining({
              collapsedChildren: expect.objectContaining({
                leftNodes: expect.arrayContaining([expect.objectContaining({ id: 'left-child' })]),
                leftEdges: expect.any(Array),
                rightNodes: [],
                rightEdges: [],
              }),
            }),
          }),
        ])
      );

      // Test that collapsed nodes are removed from the main nodes array
      const setNodesCall = mockCoreState.setNodes.mock.calls[0][0];
      expect(setNodesCall.find((n: any) => n.id === 'left-child')).toBeUndefined();
    });
  });

  describe('expand', () => {
    it('should expand nodes on the specified side', async () => {
      const collapsedChildNode = {
        id: 'left-child',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: -100, y: 50 },
        data: {
          level: 1,
          content: 'Left Child',
          parentId: 'parent-1',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
      };

      const collapsedEdge = {
        id: 'edge-1',
        source: 'parent-1',
        target: 'left-child',
        type: MINDMAP_TYPES.EDGE,
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };

      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Parent',
            side: SIDE.MID,
            isCollapsed: false,
            collapsedChildren: {
              leftNodes: [collapsedChildNode],
              leftEdges: [collapsedEdge],
              rightNodes: [],
              rightEdges: [],
            },
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const state = useNodeManipulationStore.getState();
      state.expand('parent-1', SIDE.LEFT);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test that collapsed children are restored to main arrays
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'parent-1',
            data: expect.objectContaining({
              collapsedChildren: {
                leftNodes: [],
                leftEdges: [],
                rightNodes: [],
                rightEdges: [],
              },
            }),
          }),
          expect.objectContaining({ id: 'left-child' }),
        ])
      );

      expect(mockCoreState.setEdges).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'edge-1' })])
      );
    });

    it('should return early if no collapsed children exist', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Parent',
            side: SIDE.MID,
            isCollapsed: false,
            collapsedChildren: {
              leftNodes: [],
              leftEdges: [],
              rightNodes: [],
              rightEdges: [],
            },
          },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = [];

      const state = useNodeManipulationStore.getState();
      state.expand('parent-1', SIDE.LEFT);

      expect(mockCoreState.setNodes).not.toHaveBeenCalled();
      expect(mockCoreState.setEdges).not.toHaveBeenCalled();
    });

    it('should only affect nodes on the specified side', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Parent',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
        {
          id: 'left-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Left Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'right-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Right Child',
            parentId: 'parent-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = [];

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([
        {
          id: 'left-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Left Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'right-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Right Child',
            parentId: 'parent-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ]);

      const state = useNodeManipulationStore.getState();
      state.collapse('parent-1', SIDE.LEFT);

      // Test that only left side nodes are stored in collapsedChildren
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'parent-1',
            data: expect.objectContaining({
              collapsedChildren: expect.objectContaining({
                leftNodes: expect.arrayContaining([expect.objectContaining({ id: 'left-child' })]),
                rightNodes: [], // Should be empty
              }),
            }),
          }),
          expect.objectContaining({ id: 'right-child' }), // Should remain in main nodes array
        ])
      );

      // Test that collapsed left nodes are removed from main nodes array
      const setNodesCall = mockCoreState.setNodes.mock.calls[0][0];
      expect(setNodesCall.find((n: any) => n.id === 'left-child')).toBeUndefined();
      expect(setNodesCall.find((n: any) => n.id === 'right-child')).toBeDefined();
    });
  });

  describe('collapse edge cases', () => {
    it('should return early if node is not found', async () => {
      mockCoreState.nodes = [];
      mockCoreState.edges = [];

      const state = useNodeManipulationStore.getState();
      state.collapse('nonexistent-node', SIDE.LEFT);

      expect(mockCoreState.setNodes).not.toHaveBeenCalled();
      expect(mockCoreState.setEdges).not.toHaveBeenCalled();
    });

    it('should handle nodes already collapsed by another ancestor', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Parent',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
            collapsedBy: 'ancestor-1', // Already collapsed by another ancestor
          },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = [];

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Child',
            parentId: 'parent-1',
            side: SIDE.LEFT,
            isCollapsed: false,
            collapsedBy: 'ancestor-1',
          },
        },
      ]);

      const state = useNodeManipulationStore.getState();
      state.collapse('parent-1', SIDE.LEFT);

      // Test that collapsedBy is preserved from the original ancestor
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'parent-1',
            data: expect.objectContaining({
              collapsedChildren: expect.objectContaining({
                leftNodes: expect.arrayContaining([
                  expect.objectContaining({
                    id: 'child-1',
                    data: expect.objectContaining({
                      collapsedBy: 'ancestor-1', // Should preserve original collapsedBy
                    }),
                  }),
                ]),
              }),
            }),
          }),
        ])
      );
    });
  });

  describe('moveToChild', () => {
    it('should prevent moving node to itself', () => {
      const state = useNodeManipulationStore.getState();
      state.moveToChild('node-1', 'node-1');

      expect(mockCoreState.setNodes).not.toHaveBeenCalled();
      expect(mockCoreState.setEdges).not.toHaveBeenCalled();
    });

    it('should prevent moving node to its descendant', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'parent-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: { level: 1, content: 'Parent', side: SIDE.LEFT, isCollapsed: false },
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 2, content: 'Child', parentId: 'parent-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ];

      mockCoreState.nodes = mockNodes;

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 2, content: 'Child', parentId: 'parent-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ]);

      const { toast } = await import('sonner');

      const state = useNodeManipulationStore.getState();
      state.moveToChild('parent-1', 'child-1');

      expect(toast.error).toHaveBeenCalledWith('Cannot move a node to one of its descendants.');
      expect(mockCoreState.setNodes).not.toHaveBeenCalled();
    });

    it('should move node to new parent and update levels', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'root-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: { level: 0, content: 'Root', side: SIDE.MID, isCollapsed: false },
        },
        {
          id: 'source-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: { level: 1, content: 'Source', parentId: 'root-1', side: SIDE.LEFT, isCollapsed: false },
        },
        {
          id: 'target-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: { level: 1, content: 'Target', parentId: 'root-1', side: SIDE.RIGHT, isCollapsed: false },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'root-1',
          target: 'source-1',
          type: MINDMAP_TYPES.EDGE,
          data: { strokeColor: 'var(--primary)', strokeWidth: 2, pathType: PATH_TYPES.SMOOTHSTEP },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);

      const state = useNodeManipulationStore.getState();
      state.moveToChild('source-1', 'target-1', SIDE.LEFT);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test node updates
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'source-1',
            data: expect.objectContaining({
              parentId: 'target-1',
              level: 2,
              side: SIDE.RIGHT,
            }),
          }),
        ])
      );
    });

    it('should create new edge when none exists', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'source-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: { level: 1, content: 'Source', side: SIDE.LEFT, isCollapsed: false },
        },
        {
          id: 'target-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 1, content: 'Target', side: SIDE.RIGHT, isCollapsed: false },
        },
      ];

      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const { getAllDescendantNodes, getRootNodeOfSubtree } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);
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

      const state = useNodeManipulationStore.getState();
      state.moveToChild('source-1', 'target-1', SIDE.LEFT);

      expect(mockCoreState.setEdges).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            source: 'target-1',
            target: 'source-1',
            type: MINDMAP_TYPES.EDGE,
            data: expect.objectContaining({
              strokeColor: 'var(--primary)',
              strokeWidth: 2,
              pathType: expect.any(String),
            }),
          }),
        ])
      );
    });
  });

  describe('updateSubtreeEdgePathType', () => {
    it('should update pathType for root node and all subtree edges', async () => {
      const mockNodes: MindMapNode[] = [
        {
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
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 1, content: 'Child', parentId: 'root-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'root-1',
          target: 'child-1',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
        {
          id: 'edge-2',
          source: 'other-1',
          target: 'other-2',
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
          data: { level: 1, content: 'Child', parentId: 'root-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ]);

      const state = useNodeManipulationStore.getState();
      state.updateSubtreeEdgePathType('root-1', PATH_TYPES.SMOOTHSTEP);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setNodes).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test node updates (root node pathType should be updated)
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'root-1',
            type: MINDMAP_TYPES.ROOT_NODE,
            data: expect.objectContaining({
              pathType: PATH_TYPES.SMOOTHSTEP,
            }),
          }),
        ])
      );

      // Test edge updates (only subtree edges should be updated)
      expect(mockCoreState.setEdges).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'edge-1',
            data: expect.objectContaining({
              pathType: PATH_TYPES.SMOOTHSTEP,
            }),
          }),
          expect.objectContaining({
            id: 'edge-2',
            data: expect.objectContaining({
              pathType: PATH_TYPES.SMOOTHSTEP, // Should remain unchanged
            }),
          }),
        ])
      );
    });

    it('should not update non-root nodes pathType', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 1, content: 'Child', side: SIDE.LEFT, isCollapsed: false },
        },
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = [];

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);

      const state = useNodeManipulationStore.getState();
      state.updateSubtreeEdgePathType('child-1', PATH_TYPES.SMOOTHSTEP);

      // Child node should remain unchanged since it's not a root node
      expect(mockCoreState.setNodes).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'child-1',
            type: MINDMAP_TYPES.TEXT_NODE, // Should remain unchanged since it's not a root node
          }),
        ])
      );
    });
  });

  describe('updateSubtreeEdgeColor', () => {
    it('should update edge color for all subtree edges', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'root-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: { level: 0, content: 'Root', side: SIDE.MID, isCollapsed: false },
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 1, content: 'Child', parentId: 'root-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ];

      const mockEdges: MindMapEdge[] = [
        {
          id: 'edge-1',
          source: 'root-1',
          target: 'child-1',
          type: MINDMAP_TYPES.EDGE,
          data: {
            strokeColor: 'var(--primary)',
            strokeWidth: 2,
            pathType: PATH_TYPES.SMOOTHSTEP,
          },
        },
        {
          id: 'edge-2',
          source: 'other-1',
          target: 'other-2',
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
          data: { level: 1, content: 'Child', parentId: 'root-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ]);

      const newColor = '#ff0000';
      const state = useNodeManipulationStore.getState();
      state.updateSubtreeEdgeColor('root-1', newColor);

      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();
      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test edge updates (only subtree edges should be updated)
      expect(mockCoreState.setEdges).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'edge-1',
            data: expect.objectContaining({
              strokeColor: newColor,
            }),
          }),
          expect.objectContaining({
            id: 'edge-2',
            data: expect.objectContaining({
              strokeColor: 'var(--primary)', // Should remain unchanged
            }),
          }),
        ])
      );
    });

    it('should handle empty subtree', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'root-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: { level: 0, content: 'Root', side: SIDE.MID, isCollapsed: false },
        },
      ];

      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);

      const state = useNodeManipulationStore.getState();
      state.updateSubtreeEdgeColor('root-1', '#ff0000');

      expect(mockCoreState.setEdges).toHaveBeenCalled();

      // Test that setEdges is called even with empty subtree
      expect(mockCoreState.setEdges).toHaveBeenCalledWith(mockEdges);
    });
  });
});
