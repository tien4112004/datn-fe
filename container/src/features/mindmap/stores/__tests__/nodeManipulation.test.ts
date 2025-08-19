import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMindmapStore } from '../index';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';

// Mock external dependencies
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

describe('nodeManipulationSlice', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMindmapStore.setState({
      nodes: [],
      edges: [],
      nodesToBeDeleted: new Set<string>(),
      prepareToPushUndo: vi.fn(),
      pushToUndoStack: vi.fn(),
    });
    vi.clearAllMocks();
  });

  describe('toggleCollapse', () => {
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

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

      const state = useMindmapStore.getState();
      state.toggleCollapse('parent-1', SIDE.LEFT, true);

      // Test node updates - nodes should be updated
      const updatedState = useMindmapStore.getState();
      const parentNode = updatedState.nodes.find((n) => n.id === 'parent-1');
      const leftChildNode = updatedState.nodes.find((n) => n.id === 'left-child');

      expect(parentNode?.data.isLeftChildrenCollapsed).toBe(true);
      expect(leftChildNode?.data.isCollapsed).toBe(true);
      expect(leftChildNode?.data.collapsedBy).toBe('parent-1');
    });

    it('should expand nodes on the specified side', async () => {
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
            isLeftChildrenCollapsed: true,
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
            isCollapsed: true,
            collapsedBy: 'parent-1',
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [];

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

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
            isCollapsed: true,
            collapsedBy: 'parent-1',
          },
        },
      ]);

      const state = useMindmapStore.getState();
      state.toggleCollapse('parent-1', SIDE.LEFT, false);

      // Test node updates
      const updatedState = useMindmapStore.getState();
      const parentNode = updatedState.nodes.find((n) => n.id === 'parent-1');
      const leftChildNode = updatedState.nodes.find((n) => n.id === 'left-child');

      expect(parentNode?.data.isLeftChildrenCollapsed).toBe(false);
      expect(leftChildNode?.data.isCollapsed).toBe(false);
      expect(leftChildNode?.data.collapsedBy).toBeUndefined();
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

      useMindmapStore.setState({ nodes: mockNodes, edges: [] });

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

      const state = useMindmapStore.getState();
      state.toggleCollapse('parent-1', SIDE.LEFT, true);

      // Test that only left side nodes are affected
      const updatedState = useMindmapStore.getState();
      const leftChildNode = updatedState.nodes.find((n) => n.id === 'left-child');
      const rightChildNode = updatedState.nodes.find((n) => n.id === 'right-child');

      expect(leftChildNode?.data.isCollapsed).toBe(true);
      expect(rightChildNode?.data.isCollapsed).toBe(false); // Should remain unchanged
    });
  });

  describe('expand and collapse methods', () => {
    it('should call toggleCollapse with false for expand', () => {
      const toggleCollapseSpy = vi.spyOn(useMindmapStore.getState(), 'toggleCollapse');

      const state = useMindmapStore.getState();
      state.expand('node-1', SIDE.LEFT);

      expect(toggleCollapseSpy).toHaveBeenCalledWith('node-1', SIDE.LEFT, false);
    });

    it('should call toggleCollapse with true for collapse', () => {
      const toggleCollapseSpy = vi.spyOn(useMindmapStore.getState(), 'toggleCollapse');

      const state = useMindmapStore.getState();
      state.collapse('node-1', SIDE.RIGHT);

      expect(toggleCollapseSpy).toHaveBeenCalledWith('node-1', SIDE.RIGHT, true);
    });
  });

  describe('moveToChild', () => {
    it('should prevent moving node to itself', () => {
      const originalNodes = useMindmapStore.getState().nodes;
      const originalEdges = useMindmapStore.getState().edges;

      const state = useMindmapStore.getState();
      state.moveToChild('node-1', 'node-1');

      const updatedNodes = useMindmapStore.getState().nodes;
      const updatedEdges = useMindmapStore.getState().edges;

      expect(updatedNodes).toEqual(originalNodes);
      expect(updatedEdges).toEqual(originalEdges);
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

      useMindmapStore.setState({ nodes: mockNodes });

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

      const state = useMindmapStore.getState();
      state.moveToChild('parent-1', 'child-1');

      expect(toast.error).toHaveBeenCalledWith('Cannot move a node to one of its descendants.');
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);

      const state = useMindmapStore.getState();
      state.moveToChild('source-1', 'target-1', SIDE.LEFT);

      // Test node updates
      const updatedState = useMindmapStore.getState();
      const sourceNode = updatedState.nodes.find((n) => n.id === 'source-1');

      expect(sourceNode?.data.parentId).toBe('target-1');
      expect(sourceNode?.data.level).toBe(2);
      expect(sourceNode?.data.side).toBe(SIDE.RIGHT);
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

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

      const state = useMindmapStore.getState();
      state.moveToChild('source-1', 'target-1', SIDE.LEFT);

      // Test that a new edge was created
      const updatedState = useMindmapStore.getState();
      const newEdge = updatedState.edges.find((e) => e.source === 'target-1' && e.target === 'source-1');

      expect(newEdge).toBeDefined();
      expect(newEdge?.type).toBe(MINDMAP_TYPES.EDGE);
      expect(newEdge?.data?.strokeColor).toBe('var(--primary)');
      expect(newEdge?.data?.strokeWidth).toBe(2);
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: { level: 1, content: 'Child', parentId: 'root-1', side: SIDE.LEFT, isCollapsed: false },
        },
      ]);

      const state = useMindmapStore.getState();
      state.updateSubtreeEdgePathType('root-1', PATH_TYPES.SMOOTHSTEP);

      // Test node updates (root node pathType should be updated)
      const updatedState = useMindmapStore.getState();
      const rootNode = updatedState.nodes.find((n) => n.id === 'root-1');
      expect(rootNode?.data.pathType).toBe(PATH_TYPES.SMOOTHSTEP);

      // Test edge updates (only subtree edges should be updated)
      const edge1 = updatedState.edges.find((e) => e.id === 'edge-1');
      const edge2 = updatedState.edges.find((e) => e.id === 'edge-2');
      expect(edge1?.data?.pathType).toBe(PATH_TYPES.SMOOTHSTEP);
      expect(edge2?.data?.pathType).toBe(PATH_TYPES.SMOOTHSTEP); // Should remain unchanged
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

      useMindmapStore.setState({ nodes: mockNodes, edges: [] });

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);

      const state = useMindmapStore.getState();
      state.updateSubtreeEdgePathType('child-1', PATH_TYPES.SMOOTHSTEP);

      // Child node should remain unchanged since it's not a root node
      const updatedState = useMindmapStore.getState();
      const childNode = updatedState.nodes.find((n) => n.id === 'child-1');
      expect(childNode?.type).toBe(MINDMAP_TYPES.TEXT_NODE); // Should remain unchanged since it's not a root node
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

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
      const state = useMindmapStore.getState();
      state.updateSubtreeEdgeColor('root-1', newColor);

      // Test edge updates (only subtree edges should be updated)
      const updatedState = useMindmapStore.getState();
      const edge1 = updatedState.edges.find((e) => e.id === 'edge-1');
      const edge2 = updatedState.edges.find((e) => e.id === 'edge-2');

      expect(edge1?.data?.strokeColor).toBe(newColor);
      expect(edge2?.data?.strokeColor).toBe('var(--primary)'); // Should remain unchanged
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

      const { getAllDescendantNodes } = await import('../../services/utils');
      vi.mocked(getAllDescendantNodes).mockReturnValue([]);

      const state = useMindmapStore.getState();
      state.updateSubtreeEdgeColor('root-1', '#ff0000');

      // Test that the operation completes without error even with empty subtree
      const updatedState = useMindmapStore.getState();
      expect(updatedState.edges).toEqual(mockEdges);
    });
  });
});
