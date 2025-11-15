import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useLayoutStore } from '../layout';
import { useCoreStore } from '../core';
import { useUndoRedoStore } from '../undoredo';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge, Direction } from '../../types';
import * as d3 from 'd3';

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

vi.mock('../../services/D3LayoutService', () => ({
  d3LayoutService: {
    layoutAllTrees: vi.fn(),
    layoutSubtree: vi.fn(),
    getSubtreeNodes: vi.fn(),
  },
}));

vi.mock('d3', () => ({
  timer: vi.fn(),
  easeCubicInOut: vi.fn((t) => t), // Simple linear easing for testing
}));

describe('useLayoutStore', () => {
  let mockCoreState: any;
  let mockUndoRedoState: any;
  let mockTimer: any;

  beforeEach(() => {
    // Reset store state
    useLayoutStore.setState({
      layout: 'horizontal',
      isAnimating: false,
      animationTimer: null,
      animationData: [],
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

    // Mock timer
    mockTimer = {
      stop: vi.fn(),
    };

    vi.mocked(useCoreStore.getState).mockReturnValue(mockCoreState);
    vi.mocked(useUndoRedoStore.getState).mockReturnValue(mockUndoRedoState);
    vi.mocked(d3.timer).mockReturnValue(mockTimer);

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any running timers
    const state = useLayoutStore.getState();
    if (state.animationTimer) {
      state.stopAnimation();
    }
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useLayoutStore.getState();
      expect(state.layout).toBe('horizontal');
      expect(state.isAnimating).toBe(false);
      expect(state.animationTimer).toBeNull();
      expect(state.animationData).toEqual([]);
    });
  });

  describe('Basic Setters', () => {
    it('should set layout direction', () => {
      const state = useLayoutStore.getState();
      state.setLayout('vertical' as Direction);

      expect(useLayoutStore.getState().layout).toBe('vertical');
    });

    it('should set animation state', () => {
      const state = useLayoutStore.getState();
      state.setIsAnimating(true);

      expect(useLayoutStore.getState().isAnimating).toBe(true);

      state.setIsAnimating(false);
      expect(useLayoutStore.getState().isAnimating).toBe(false);
    });
  });

  describe('stopAnimation', () => {
    it('should stop running animation and reset state', () => {
      // Set up animation state
      useLayoutStore.setState({
        animationTimer: mockTimer,
        isAnimating: true,
        animationData: [
          {
            id: 'node-1',
            startPos: { x: 0, y: 0 },
            targetPos: { x: 100, y: 100 },
            deltaX: 100,
            deltaY: 100,
          },
        ],
      });

      const state = useLayoutStore.getState();
      state.stopAnimation();

      expect(mockTimer.stop).toHaveBeenCalled();

      const updatedState = useLayoutStore.getState();
      expect(updatedState.animationTimer).toBeNull();
      expect(updatedState.isAnimating).toBe(false);
      expect(updatedState.animationData).toEqual([]);
    });

    it('should handle no running animation gracefully', () => {
      const state = useLayoutStore.getState();
      state.stopAnimation();

      expect(mockTimer.stop).not.toHaveBeenCalled();
    });
  });

  describe('animateNodesToPositions', () => {
    beforeEach(() => {
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
          position: { x: 50, y: 50 },
          data: {
            level: 1,
            content: 'Node 2',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      mockCoreState.nodes = mockNodes;
    });

    it('should set up animation data and start timer', () => {
      const targetPositions = {
        'node-1': { x: 100, y: 100 },
        'node-2': { x: 200, y: 200 },
      };

      const state = useLayoutStore.getState();
      state.animateNodesToPositions(targetPositions);

      const updatedState = useLayoutStore.getState();
      expect(updatedState.isAnimating).toBe(true);
      expect(updatedState.animationData).toHaveLength(2);
      expect(updatedState.animationTimer).toBe(mockTimer);

      // Check animation data structure
      const animData = updatedState.animationData;
      expect(animData[0]).toEqual({
        id: 'node-1',
        startPos: { x: 0, y: 0 },
        targetPos: { x: 100, y: 100 },
        deltaX: 100,
        deltaY: 100,
      });
    });

    it('should stop existing animation before starting new one', () => {
      const existingTimer = { stop: vi.fn() };
      useLayoutStore.setState({ animationTimer: existingTimer } as any);

      const targetPositions = { 'node-1': { x: 100, y: 100 } };

      const state = useLayoutStore.getState();
      state.animateNodesToPositions(targetPositions);

      expect(existingTimer.stop).toHaveBeenCalled();
    });

    it('should handle empty nodes gracefully', () => {
      mockCoreState.nodes = [];

      const targetPositions = { 'node-1': { x: 100, y: 100 } };

      const state = useLayoutStore.getState();
      state.animateNodesToPositions(targetPositions);

      expect(d3.timer).not.toHaveBeenCalled();
    });

    it('should handle nodes without target positions', () => {
      const targetPositions = {
        'node-1': { x: 100, y: 100 },
        // node-2 is missing from target positions
      };

      const state = useLayoutStore.getState();
      state.animateNodesToPositions(targetPositions);

      const updatedState = useLayoutStore.getState();
      expect(updatedState.animationData).toHaveLength(1);
      expect(updatedState.animationData[0].id).toBe('node-1');
    });

    it('should use custom duration', () => {
      const targetPositions = { 'node-1': { x: 100, y: 100 } };
      const customDuration = 1000;

      const state = useLayoutStore.getState();
      state.animateNodesToPositions(targetPositions, customDuration);

      expect(d3.timer).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('updateLayout', () => {
    beforeEach(() => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Root',
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

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;
      // Enable auto-layout for these tests
      useLayoutStore.setState({ isAutoLayoutEnabled: true });
    });

    it('should perform layout update with D3 service', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');

      const layoutedNodes = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 0,
            content: 'Root',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
      ];

      const layoutedEdges = [
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

      vi.mocked(d3LayoutService.layoutAllTrees).mockResolvedValue({
        nodes: layoutedNodes,
        edges: layoutedEdges,
      });

      const state = useLayoutStore.getState();
      state.updateLayout('vertical' as Direction);

      // Should set layouting state immediately
      expect(useLayoutStore.getState().isLayouting).toBe(true);

      // Wait for layout to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(d3LayoutService.layoutAllTrees).toHaveBeenCalledWith(
        mockCoreState.nodes,
        mockCoreState.edges,
        'vertical'
      );

      expect(mockCoreState.setEdges).toHaveBeenCalledWith(layoutedEdges);
    });

    it('should use current layout direction if none provided', async () => {
      useLayoutStore.setState({ layout: 'radial' as Direction });

      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.layoutAllTrees).mockResolvedValue({
        nodes: [],
        edges: [],
      });

      const state = useLayoutStore.getState();
      state.updateLayout();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(d3LayoutService.layoutAllTrees).toHaveBeenCalledWith(
        mockCoreState.nodes,
        mockCoreState.edges,
        'radial'
      );
    });

    it('should handle layout service errors', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.layoutAllTrees).mockRejectedValue(new Error('Layout failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = useLayoutStore.getState();
      state.updateLayout();

      // Wait for error to be handled
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalledWith('Layout update failed:', expect.any(Error));
      expect(useLayoutStore.getState().isLayouting).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle empty nodes/edges gracefully', async () => {
      mockCoreState.nodes = [];
      mockCoreState.edges = undefined;

      const state = useLayoutStore.getState();
      state.updateLayout();

      const { d3LayoutService } = await import('../../services/D3LayoutService');
      expect(d3LayoutService.layoutAllTrees).not.toHaveBeenCalled();
    });
  });

  describe('updateSubtreeLayout', () => {
    beforeEach(() => {
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
          },
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Child',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
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
      ];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;
    });

    it('should perform subtree layout update', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');

      // Mock getSubtreeNodes
      vi.mocked(d3LayoutService.getSubtreeNodes).mockReturnValue([
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Child',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ]);

      // Mock layoutSubtree
      const layoutedNodes = [
        {
          id: 'root-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Root',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 150, y: 150 },
          data: {
            level: 1,
            content: 'Child',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const layoutedEdges = mockCoreState.edges;

      vi.mocked(d3LayoutService.layoutSubtree).mockResolvedValue({
        nodes: layoutedNodes,
        edges: layoutedEdges,
      });

      const state = useLayoutStore.getState();
      await state.updateSubtreeLayout('root-1', 'vertical' as Direction);

      expect(d3LayoutService.getSubtreeNodes).toHaveBeenCalledWith('root-1', mockCoreState.nodes);
      expect(d3LayoutService.layoutSubtree).toHaveBeenCalledWith(
        mockCoreState.nodes[0], // root node
        expect.any(Array), // descendant nodes
        expect.any(Array), // subtree edges
        'vertical'
      );

      expect(mockCoreState.setEdges).toHaveBeenCalled();
    });

    it('should handle missing root node', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = useLayoutStore.getState();
      await state.updateSubtreeLayout('non-existent', 'vertical' as Direction);

      expect(consoleSpy).toHaveBeenCalledWith('Root node not found for subtree layout');
      expect(useLayoutStore.getState().isLayouting).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle layout service errors', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.getSubtreeNodes).mockReturnValue([]);
      vi.mocked(d3LayoutService.layoutSubtree).mockRejectedValue(new Error('Subtree layout failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = useLayoutStore.getState();
      await state.updateSubtreeLayout('root-1', 'vertical' as Direction);

      expect(consoleSpy).toHaveBeenCalledWith('Subtree layout update failed:', expect.any(Error));
      expect(useLayoutStore.getState().isLayouting).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle no layout changes gracefully', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.getSubtreeNodes).mockReturnValue([]);
      vi.mocked(d3LayoutService.layoutSubtree).mockResolvedValue({
        nodes: [], // No nodes to update positions
        edges: [],
      });

      const state = useLayoutStore.getState();
      await state.updateSubtreeLayout('root-1', 'vertical' as Direction);

      expect(useLayoutStore.getState().isLayouting).toBe(false);
    });
  });

  describe('onLayoutChange', () => {
    it('should save state to undo stack and update layout direction', async () => {
      const mockNodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 0,
            content: 'Root',
            side: SIDE.MID,
            isCollapsed: false,
          },
        },
      ];

      const mockEdges: MindMapEdge[] = [];

      mockCoreState.nodes = mockNodes;
      mockCoreState.edges = mockEdges;

      const state = useLayoutStore.getState();
      state.onLayoutChange('vertical' as Direction);

      // Should save to undo stack
      expect(mockUndoRedoState.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoState.pushToUndoStack).toHaveBeenCalled();

      // Should update layout direction
      expect(useLayoutStore.getState().layout).toBe('vertical');
    });
  });
});
