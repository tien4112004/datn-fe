import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMindmapStore } from '../index';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge, Direction } from '../../types';
import * as d3 from 'd3';

// Mock external dependencies
vi.mock('../../services/D3LayoutService', () => ({
  d3LayoutService: {
    layoutAllTrees: vi.fn(),
    layoutSubtree: vi.fn(),
    getSubtreeNodes: vi.fn(),
  },
}));

const mockTimer = {
  stop: vi.fn(),
  restart: vi.fn(),
};

vi.mock('d3', () => ({
  timer: vi.fn(() => mockTimer),
  easeCubicInOut: vi.fn((t) => t), // Simple linear easing for testing
}));

// Mock undo/redo methods that are now part of the unified store
const mockUndoRedoMethods = {
  prepareToPushUndo: vi.fn(),
  pushToUndoStack: vi.fn(),
};

describe('layoutSlice', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMindmapStore.setState({
      nodes: [],
      edges: [],
      layout: 'horizontal',
      isLayouting: false,
      isAnimating: false,
      animationTimer: null,
      animationData: [],
      // Mock undo/redo methods
      prepareToPushUndo: mockUndoRedoMethods.prepareToPushUndo,
      pushToUndoStack: mockUndoRedoMethods.pushToUndoStack,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any running timers
    const state = useMindmapStore.getState();
    if (state.animationTimer && state.stopAnimation) {
      state.stopAnimation();
    }
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useMindmapStore.getState();
      expect(state.layout).toBe('horizontal');
      expect(state.isAnimating).toBe(false);
      expect(state.isLayouting).toBe(false);
      expect(state.animationTimer).toBeNull();
      expect(state.animationData).toEqual([]);
    });
  });

  describe('Basic Setters', () => {
    it('should set layout direction', () => {
      const state = useMindmapStore.getState();
      if (state.setLayout) {
        state.setLayout('vertical' as Direction);
        const updatedState = useMindmapStore.getState();
        expect(updatedState.layout).toBe('vertical');
      }
    });

    it('should set animation state', () => {
      const state = useMindmapStore.getState();
      if (state.setIsAnimating) {
        state.setIsAnimating(true);
        const updatedState = useMindmapStore.getState();
        expect(updatedState.isAnimating).toBe(true);
      }
    });
  });

  describe('stopAnimation', () => {
    it('should stop running animation and reset state', () => {
      useMindmapStore.setState({ animationTimer: mockTimer, isAnimating: true });

      const state = useMindmapStore.getState();
      if (state.stopAnimation) {
        state.stopAnimation();
      }

      expect(mockTimer.stop).toHaveBeenCalled();
      const updatedState = useMindmapStore.getState();
      expect(updatedState.animationTimer).toBeNull();
      expect(updatedState.isAnimating).toBe(false);
    });

    it('should handle no running animation gracefully', () => {
      useMindmapStore.setState({ animationTimer: null });

      const state = useMindmapStore.getState();
      if (state.stopAnimation) {
        state.stopAnimation();
      }

      expect(mockTimer.stop).not.toHaveBeenCalled();
    });
  });

  describe('animateNodesToPositions', () => {
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
      {
        id: 'node-2',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 100, y: 100 },
        data: {
          level: 1,
          content: 'Child',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
      },
    ];

    beforeEach(() => {
      useMindmapStore.setState({ nodes: mockNodes });
    });

    it('should set up animation data and start timer', () => {
      const targetPositions = {
        'node-1': { x: 50, y: 50 },
        'node-2': { x: 150, y: 150 },
      };

      const state = useMindmapStore.getState();
      if (state.animateNodesToPositions) {
        state.animateNodesToPositions(targetPositions, 1000);
      }

      expect(d3.timer).toHaveBeenCalled();
    });

    it('should stop existing animation before starting new one', () => {
      useMindmapStore.setState({ animationTimer: mockTimer });

      const targetPositions = {
        'node-1': { x: 50, y: 50 },
      };

      const state = useMindmapStore.getState();
      if (state.animateNodesToPositions) {
        state.animateNodesToPositions(targetPositions);
      }

      expect(mockTimer.stop).toHaveBeenCalled();
    });

    it('should handle empty nodes gracefully', () => {
      useMindmapStore.setState({ nodes: [] });

      const state = useMindmapStore.getState();
      if (state.animateNodesToPositions) {
        state.animateNodesToPositions({});
      }

      expect(d3.timer).not.toHaveBeenCalled();
    });

    it('should handle nodes without target positions', () => {
      const targetPositions = {
        'non-existent': { x: 50, y: 50 },
      };

      const state = useMindmapStore.getState();
      if (state.animateNodesToPositions) {
        state.animateNodesToPositions(targetPositions);
      }

      expect(d3.timer).toHaveBeenCalled();
    });

    it('should use custom duration', () => {
      const targetPositions = {
        'node-1': { x: 50, y: 50 },
      };

      const customDuration = 5000;
      const state = useMindmapStore.getState();
      if (state.animateNodesToPositions) {
        state.animateNodesToPositions(targetPositions, customDuration);
      }

      expect(d3.timer).toHaveBeenCalled();
    });
  });

  describe('updateLayout', () => {
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

    beforeEach(() => {
      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });
    });

    it('should perform layout update with D3 service', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.layoutAllTrees).mockResolvedValue({
        nodes: mockNodes,
        edges: mockEdges,
      });

      const state = useMindmapStore.getState();
      if (state.updateLayout) {
        await state.updateLayout('vertical' as Direction);
      }

      expect(d3LayoutService.layoutAllTrees).toHaveBeenCalledWith(mockNodes, mockEdges, 'vertical');
    });

    it('should use current layout direction if none provided', async () => {
      useMindmapStore.setState({ layout: 'vertical' });

      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.layoutAllTrees).mockResolvedValue({
        nodes: mockNodes,
        edges: mockEdges,
      });

      const state = useMindmapStore.getState();
      if (state.updateLayout) {
        await state.updateLayout();
      }

      expect(d3LayoutService.layoutAllTrees).toHaveBeenCalledWith(mockNodes, mockEdges, 'vertical');
    });

    it('should handle layout service errors', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.layoutAllTrees).mockRejectedValue(new Error('Layout failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = useMindmapStore.getState();
      if (state.updateLayout) {
        await state.updateLayout('vertical' as Direction);
      }

      expect(consoleSpy).toHaveBeenCalledWith('Layout update failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle empty nodes/edges gracefully', async () => {
      useMindmapStore.setState({ nodes: [], edges: [] });

      const { d3LayoutService } = await import('../../services/D3LayoutService');
      const layoutSpy = vi.mocked(d3LayoutService.layoutAllTrees);

      const state = useMindmapStore.getState();
      if (state.updateLayout) {
        await state.updateLayout();
      }

      expect(layoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateSubtreeLayout', () => {
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

    beforeEach(() => {
      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });
    });

    it('should perform subtree layout update', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.getSubtreeNodes).mockReturnValue([mockNodes[1]]);
      vi.mocked(d3LayoutService.layoutSubtree).mockResolvedValue({
        nodes: mockNodes,
        edges: mockEdges,
      });

      const state = useMindmapStore.getState();
      if (state.updateSubtreeLayout) {
        await state.updateSubtreeLayout('root-1', 'vertical' as Direction);
      }

      expect(d3LayoutService.getSubtreeNodes).toHaveBeenCalledWith('root-1', mockNodes);
      expect(d3LayoutService.layoutSubtree).toHaveBeenCalled();
    });

    it('should handle missing root node', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = useMindmapStore.getState();
      if (state.updateSubtreeLayout) {
        await state.updateSubtreeLayout('non-existent', 'vertical' as Direction);
      }

      expect(consoleSpy).toHaveBeenCalledWith('Root node not found for subtree layout');

      consoleSpy.mockRestore();
    });

    it('should handle layout service errors', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.getSubtreeNodes).mockReturnValue([mockNodes[1]]);
      vi.mocked(d3LayoutService.layoutSubtree).mockRejectedValue(new Error('Subtree layout failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const state = useMindmapStore.getState();
      if (state.updateSubtreeLayout) {
        await state.updateSubtreeLayout('root-1', 'vertical' as Direction);
      }

      expect(consoleSpy).toHaveBeenCalledWith('Subtree layout update failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle no layout changes gracefully', async () => {
      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.getSubtreeNodes).mockReturnValue([]);
      vi.mocked(d3LayoutService.layoutSubtree).mockResolvedValue({
        nodes: [], // No nodes to update positions
        edges: [],
      });

      const state = useMindmapStore.getState();
      if (state.updateSubtreeLayout) {
        await state.updateSubtreeLayout('root-1', 'vertical' as Direction);
      }

      // Should complete without calling animation
      const finalState = useMindmapStore.getState();
      expect(finalState.isLayouting).toBe(false);
    });
  });

  describe('onLayoutChange', () => {
    it('should save state to undo stack and trigger layout update', async () => {
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

      useMindmapStore.setState({ nodes: mockNodes, edges: mockEdges });

      const { d3LayoutService } = await import('../../services/D3LayoutService');
      vi.mocked(d3LayoutService.layoutAllTrees).mockResolvedValue({
        nodes: mockNodes,
        edges: mockEdges,
      });

      const state = useMindmapStore.getState();
      if (state.onLayoutChange) {
        state.onLayoutChange('vertical' as Direction);
      }

      // Should prepare and save to undo stack
      expect(mockUndoRedoMethods.prepareToPushUndo).toHaveBeenCalled();
      expect(mockUndoRedoMethods.pushToUndoStack).toHaveBeenCalled();

      // Should trigger layout update
      await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async
      expect(d3LayoutService.layoutAllTrees).toHaveBeenCalled();
    });
  });
});
