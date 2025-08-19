import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMindmapStore } from '../index';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode, MindMapEdge } from '../../types';

// Mock external dependencies
vi.mock('@/shared/lib/utils', () => ({
  generateId: vi.fn(() => `mock-id-${Math.random()}`),
}));

describe('importExportSlice', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMindmapStore.setState({
      nodes: [],
      edges: [],
      isExporting: false,
      isImporting: false,
    });

    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useMindmapStore.getState();
      expect(state.isExporting).toBe(false);
      expect(state.isImporting).toBe(false);
    });
  });

  describe('exportToJSON', () => {
    beforeEach(() => {
      // Set up test data
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
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Child Node',
            parentId: 'node-1',
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
    });

    it('should export mindmap data to JSON string', () => {
      const state = useMindmapStore.getState();
      const jsonString = state.exportToJSON();

      expect(typeof jsonString).toBe('string');
      const parsedData = JSON.parse(jsonString);

      expect(parsedData.nodes).toHaveLength(2);
      expect(parsedData.edges).toHaveLength(1);
      expect(parsedData.metadata).toBeDefined();
      expect(parsedData.metadata.version).toBe('1.0.0');
      expect(parsedData.metadata.exportedAt).toBeDefined();
    });

    it('should include layout information by default', () => {
      const state = useMindmapStore.getState();
      const jsonString = state.exportToJSON();
      const parsedData = JSON.parse(jsonString);

      expect(parsedData.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(parsedData.nodes[1].position).toEqual({ x: 100, y: 100 });
    });

    it('should exclude layout information when includeLayout is false', () => {
      const state = useMindmapStore.getState();
      const jsonString = state.exportToJSON({ includeLayout: false });
      const parsedData = JSON.parse(jsonString);

      expect(parsedData.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(parsedData.nodes[1].position).toEqual({ x: 0, y: 0 });
      expect(parsedData.nodes[0].style).toBeUndefined();
      expect(parsedData.edges[0].style).toBeUndefined();
    });

    it('should include custom metadata when provided', () => {
      const state = useMindmapStore.getState();
      const options = {
        title: 'Test Mindmap',
        description: 'This is a test mindmap',
        indentSize: 4,
      };
      const jsonString = state.exportToJSON(options);
      const parsedData = JSON.parse(jsonString);

      expect(parsedData.metadata.title).toBe('Test Mindmap');
      expect(parsedData.metadata.description).toBe('This is a test mindmap');
    });

    it('should handle empty mindmap data', () => {
      useMindmapStore.setState({ nodes: [], edges: [] });

      const state = useMindmapStore.getState();
      const jsonString = state.exportToJSON();
      const parsedData = JSON.parse(jsonString);

      expect(parsedData.nodes).toEqual([]);
      expect(parsedData.edges).toEqual([]);
      expect(parsedData.metadata).toBeDefined();
    });
  });

  describe('validateMindmapData', () => {
    it('should validate correct export format', () => {
      const validData = {
        nodes: [],
        edges: [],
        metadata: {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
        },
      };

      const state = useMindmapStore.getState();
      expect(state.validateMindmapData(validData)).toBe(true);
    });

    it('should validate simple nodes/edges format', () => {
      const simpleData = {
        nodes: [{ id: 'test' }],
        edges: [],
      };

      const state = useMindmapStore.getState();
      expect(state.validateMindmapData(simpleData)).toBe(true);
    });

    it('should validate data with only nodes', () => {
      const nodesOnlyData = {
        nodes: [{ id: 'test' }],
      };

      const state = useMindmapStore.getState();
      expect(state.validateMindmapData(nodesOnlyData)).toBe(true);
    });

    it('should validate data with only edges', () => {
      const edgesOnlyData = {
        edges: [{ id: 'test' }],
      };

      const state = useMindmapStore.getState();
      expect(state.validateMindmapData(edgesOnlyData)).toBe(true);
    });

    it('should reject invalid data structures', () => {
      const state = useMindmapStore.getState();

      expect(state.validateMindmapData(null)).toBe(false);
      expect(state.validateMindmapData(undefined)).toBe(false);
      expect(state.validateMindmapData('invalid')).toBe(false);
      expect(state.validateMindmapData({})).toBe(false);
      expect(state.validateMindmapData({ invalidKey: 'value' })).toBe(false);
    });

    it('should reject data with invalid nodes/edges arrays', () => {
      const invalidData = {
        nodes: 'not-an-array',
        edges: [],
        metadata: {},
      };

      const state = useMindmapStore.getState();
      expect(state.validateMindmapData(invalidData)).toBe(false);
    });
  });

  describe('importFromJSON', () => {
    it('should import valid JSON data successfully', () => {
      const importData = {
        nodes: [
          {
            id: 'original-1',
            type: MINDMAP_TYPES.TEXT_NODE,
            position: { x: 50, y: 50 },
            data: {
              level: 1,
              content: 'Imported Node',
              side: SIDE.LEFT,
              isCollapsed: false,
            },
          },
        ],
        edges: [
          {
            id: 'original-edge-1',
            source: 'original-1',
            target: 'original-2',
            type: MINDMAP_TYPES.EDGE,
            data: {
              strokeColor: 'var(--primary)',
              strokeWidth: 2,
              pathType: PATH_TYPES.SMOOTHSTEP,
            },
          },
        ],
        metadata: {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
        },
      };

      const state = useMindmapStore.getState();
      const result = state.importFromJSON(JSON.stringify(importData));

      expect(result).toBe(true);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes).toHaveLength(1);
      expect(updatedState.edges).toHaveLength(1);

      // Nodes should have new IDs
      expect(updatedState.nodes[0].id).toMatch(/mock-id-/);
      expect(updatedState.nodes[0].selected).toBe(false);

      // Edges should have updated source/target references
      expect(updatedState.edges[0].id).toMatch(/mock-id-/);
      expect(updatedState.edges[0].source).toMatch(/mock-id-/);
    });

    it('should handle nodes without positions', () => {
      const importData = {
        nodes: [
          {
            id: 'no-position',
            type: MINDMAP_TYPES.TEXT_NODE,
            data: {
              level: 1,
              content: 'No Position Node',
              side: SIDE.LEFT,
              isCollapsed: false,
            },
          },
        ],
        edges: [],
      };

      const state = useMindmapStore.getState();
      const result = state.importFromJSON(JSON.stringify(importData));

      expect(result).toBe(true);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.nodes[0].position.x).toBeGreaterThanOrEqual(0);
      expect(updatedState.nodes[0].position.y).toBeGreaterThanOrEqual(0);
    });

    it('should update source/target handles correctly', () => {
      const importData = {
        nodes: [
          { id: 'source-node', type: MINDMAP_TYPES.TEXT_NODE, data: {} },
          { id: 'target-node', type: MINDMAP_TYPES.TEXT_NODE, data: {} },
        ],
        edges: [
          {
            id: 'edge-with-handles',
            source: 'source-node',
            target: 'target-node',
            sourceHandle: 'handle-source-node',
            targetHandle: 'handle-target-node',
            type: MINDMAP_TYPES.EDGE,
            data: {},
          },
        ],
      };

      const state = useMindmapStore.getState();
      const result = state.importFromJSON(JSON.stringify(importData));

      expect(result).toBe(true);

      const updatedState = useMindmapStore.getState();
      const edge = updatedState.edges[0];

      expect(edge.sourceHandle).toMatch(/handle-mock-id-/);
      expect(edge.targetHandle).toMatch(/handle-mock-id-/);
    });

    it('should reject invalid JSON', () => {
      const state = useMindmapStore.getState();
      const result = state.importFromJSON('invalid json');

      expect(result).toBe(false);

      const updatedState = useMindmapStore.getState();
      expect(updatedState.isImporting).toBe(false);
    });

    it('should reject data that fails validation', () => {
      const invalidData = {
        invalidStructure: 'test',
      };

      const state = useMindmapStore.getState();
      const result = state.importFromJSON(JSON.stringify(invalidData));

      expect(result).toBe(false);
    });

    it('should set importing state during operation', () => {
      const validData = { nodes: [], edges: [] };

      const state = useMindmapStore.getState();
      state.importFromJSON(JSON.stringify(validData));

      // After completion, isImporting should be false
      const updatedState = useMindmapStore.getState();
      expect(updatedState.isImporting).toBe(false);
    });
  });
});
