import { describe, it, expect } from 'vitest';
import {
  getAllDescendantNodes,
  getRootNodeOfSubtree,
  isAiGeneratedNodeStructure,
  convertAiDataToMindMapNodes,
} from '../utils';
import { MINDMAP_TYPES, PATH_TYPES, SIDE, DRAGHANDLE } from '../../types';
import type { MindMapNode, AiGeneratedNode } from '../../types';

describe('Utils', () => {
  describe('getAllDescendantNodes', () => {
    it('should return empty array when no descendants exist', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root-1',
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
          id: 'orphan-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Orphan Node',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const result = getAllDescendantNodes('root-1', nodes);
      expect(result).toEqual([]);
    });

    it('should return direct children when they exist', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root-1',
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
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Left Child',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'child-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Right Child',
            parentId: 'root-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      const result = getAllDescendantNodes('root-1', nodes);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(expect.objectContaining({ id: 'child-1' }));
      expect(result).toContainEqual(expect.objectContaining({ id: 'child-2' }));
    });

    it('should return all descendants recursively', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root-1',
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
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Child 1',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'grandchild-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -200, y: 100 },
          data: {
            level: 2,
            content: 'Grandchild 1',
            parentId: 'child-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'grandchild-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -150, y: 150 },
          data: {
            level: 2,
            content: 'Grandchild 2',
            parentId: 'child-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'great-grandchild-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -300, y: 200 },
          data: {
            level: 3,
            content: 'Great Grandchild 1',
            parentId: 'grandchild-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'child-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Child 2',
            parentId: 'root-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      const result = getAllDescendantNodes('root-1', nodes);

      expect(result).toHaveLength(5);

      // Check that all descendants are included
      const resultIds = result.map((node) => node.id);
      expect(resultIds).toContain('child-1');
      expect(resultIds).toContain('child-2');
      expect(resultIds).toContain('grandchild-1');
      expect(resultIds).toContain('grandchild-2');
      expect(resultIds).toContain('great-grandchild-1');

      // Check correct order (children first, then their descendants)
      const child1Index = resultIds.indexOf('child-1');
      const grandchild1Index = resultIds.indexOf('grandchild-1');
      const grandchild2Index = resultIds.indexOf('grandchild-2');
      const greatGrandchild1Index = resultIds.indexOf('great-grandchild-1');

      expect(child1Index).toBeLessThan(grandchild1Index);
      expect(child1Index).toBeLessThan(grandchild2Index);
      expect(grandchild1Index).toBeLessThan(greatGrandchild1Index);
    });

    it('should handle partial subtrees correctly', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root-1',
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
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -100, y: 50 },
          data: {
            level: 1,
            content: 'Child 1',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'grandchild-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: -200, y: 100 },
          data: {
            level: 2,
            content: 'Grandchild 1',
            parentId: 'child-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'child-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 50 },
          data: {
            level: 1,
            content: 'Child 2',
            parentId: 'root-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      // Get descendants of child-1 (should only include grandchild-1)
      const result = getAllDescendantNodes('child-1', nodes);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('grandchild-1');
    });

    it('should handle empty nodes array', () => {
      const result = getAllDescendantNodes('any-id', []);
      expect(result).toEqual([]);
    });

    it('should handle non-existent parent ID', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root-1',
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

      const result = getAllDescendantNodes('non-existent', nodes);
      expect(result).toEqual([]);
    });

    it('should handle circular references by throwing stack overflow', () => {
      // This is an edge case where the data structure is malformed
      const nodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Node 1',
            parentId: 'node-2',
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
            parentId: 'node-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      // This will cause a stack overflow due to infinite recursion
      // In a real scenario, we might want to add cycle detection
      expect(() => getAllDescendantNodes('node-1', nodes)).toThrow(/Maximum call stack size exceeded/);
    });
  });

  describe('getRootNodeOfSubtree', () => {
    it('should return null for non-existent node', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'root-1',
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

      const result = getRootNodeOfSubtree('non-existent', nodes);
      expect(result).toBeNull();
    });

    it('should return the node itself if it is a root node', () => {
      const rootNode: MindMapNode = {
        id: 'root-1',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: 'Root Node',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };

      const nodes: MindMapNode[] = [rootNode];

      const result = getRootNodeOfSubtree('root-1', nodes);
      expect(result).toEqual(rootNode);
    });

    it('should return root node for direct child', () => {
      const rootNode: MindMapNode = {
        id: 'root-1',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: 'Root Node',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };

      const childNode: MindMapNode = {
        id: 'child-1',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 100, y: 100 },
        data: {
          level: 1,
          content: 'Child Node',
          parentId: 'root-1',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
      };

      const nodes: MindMapNode[] = [rootNode, childNode];

      const result = getRootNodeOfSubtree('child-1', nodes);
      expect(result).toEqual(rootNode);
    });

    it('should return root node for deeply nested descendant', () => {
      const rootNode: MindMapNode = {
        id: 'root-1',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: 'Root Node',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.BEZIER,
        },
      };

      const nodes: MindMapNode[] = [
        rootNode,
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Child 1',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'grandchild-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 200, y: 200 },
          data: {
            level: 2,
            content: 'Grandchild 1',
            parentId: 'child-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'great-grandchild-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 300, y: 300 },
          data: {
            level: 3,
            content: 'Great Grandchild 1',
            parentId: 'grandchild-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const result = getRootNodeOfSubtree('great-grandchild-1', nodes);
      expect(result).toEqual(rootNode);
    });

    it('should return null for orphaned node (no parentId)', () => {
      const orphanedNode: MindMapNode = {
        id: 'orphan-1',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 100, y: 100 },
        data: {
          level: 1,
          content: 'Orphaned Node',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
      };

      const nodes: MindMapNode[] = [orphanedNode];

      const result = getRootNodeOfSubtree('orphan-1', nodes);
      expect(result).toBeNull();
    });

    it('should return null for broken parent chain', () => {
      const nodes: MindMapNode[] = [
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Child 1',
            parentId: 'non-existent-parent',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
      ];

      const result = getRootNodeOfSubtree('child-1', nodes);
      expect(result).toBeNull();
    });

    it('should handle multiple root nodes correctly', () => {
      const rootNode1: MindMapNode = {
        id: 'root-1',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: 'Root Node 1',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };

      const rootNode2: MindMapNode = {
        id: 'root-2',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 500, y: 0 },
        data: {
          level: 0,
          content: 'Root Node 2',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
      };

      const nodes: MindMapNode[] = [
        rootNode1,
        rootNode2,
        {
          id: 'child-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Child of Root 1',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'child-2',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 600, y: 100 },
          data: {
            level: 1,
            content: 'Child of Root 2',
            parentId: 'root-2',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      // Child of root-1 should return root-1
      const result1 = getRootNodeOfSubtree('child-1', nodes);
      expect(result1).toEqual(rootNode1);

      // Child of root-2 should return root-2
      const result2 = getRootNodeOfSubtree('child-2', nodes);
      expect(result2).toEqual(rootNode2);
    });

    it('should handle empty nodes array', () => {
      const result = getRootNodeOfSubtree('any-id', []);
      expect(result).toBeNull();
    });

    it('should handle circular parent references by throwing stack overflow', () => {
      // This creates a malformed tree structure
      const nodes: MindMapNode[] = [
        {
          id: 'node-1',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            level: 1,
            content: 'Node 1',
            parentId: 'node-2',
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
            parentId: 'node-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
          },
        },
      ];

      // This will cause a stack overflow due to infinite recursion
      // In a real implementation, we might want to add cycle detection
      expect(() => getRootNodeOfSubtree('node-1', nodes)).toThrow(/Maximum call stack size exceeded/);
    });

    it('should work with different node types', () => {
      const rootNode: MindMapNode = {
        id: 'root-1',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: 'Root Node',
          side: SIDE.MID,
          isCollapsed: false,
        },
      };

      const nodes: MindMapNode[] = [
        rootNode,
        {
          id: 'text-child',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 100, y: 100 },
          data: {
            level: 1,
            content: 'Text Child',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
          },
        },
        {
          id: 'shape-child',
          type: MINDMAP_TYPES.SHAPE_NODE,
          position: { x: 200, y: 100 },
          data: {
            level: 1,
            content: 'Shape Child',
            parentId: 'root-1',
            side: SIDE.RIGHT,
            isCollapsed: false,
            shape: 'rectangle',
            width: 120,
            height: 60,
          },
        },
        {
          id: 'image-child',
          type: MINDMAP_TYPES.IMAGE_NODE,
          position: { x: 300, y: 100 },
          data: {
            level: 1,
            content: 'Image Child',
            parentId: 'root-1',
            side: SIDE.LEFT,
            isCollapsed: false,
            width: 250,
            height: 180,
            alt: 'Image',
          },
        },
      ];

      // All different node types should correctly find their root
      expect(getRootNodeOfSubtree('text-child', nodes)).toEqual(rootNode);
      expect(getRootNodeOfSubtree('shape-child', nodes)).toEqual(rootNode);
      expect(getRootNodeOfSubtree('image-child', nodes)).toEqual(rootNode);
    });
  });

  describe('isAiGeneratedNodeStructure', () => {
    it('should return true for valid AI generated node structure with single root', () => {
      const validData: AiGeneratedNode[] = [
        {
          data: 'Root Topic',
          children: [
            {
              data: 'Subtopic 1',
              children: [{ data: 'Detail 1.1' }, { data: 'Detail 1.2' }],
            },
            { data: 'Subtopic 2' },
          ],
        },
      ];

      const result = isAiGeneratedNodeStructure(validData);
      expect(result).toBe(true);
    });

    it('should return true for valid AI generated node structure with multiple roots', () => {
      const validData: AiGeneratedNode[] = [
        {
          data: 'First Root',
          children: [{ data: 'Child 1' }],
        },
        {
          data: 'Second Root',
          children: [{ data: 'Child 2' }],
        },
      ];

      const result = isAiGeneratedNodeStructure(validData);
      expect(result).toBe(true);
    });

    it('should return true for simple nodes without children', () => {
      const validData: AiGeneratedNode[] = [{ data: 'Simple Node 1' }, { data: 'Simple Node 2' }];

      const result = isAiGeneratedNodeStructure(validData);
      expect(result).toBe(true);
    });

    it('should return true for empty children array', () => {
      const validData: AiGeneratedNode[] = [
        {
          data: 'Root with empty children',
          children: [],
        },
      ];

      const result = isAiGeneratedNodeStructure(validData);
      expect(result).toBe(true);
    });

    it('should return false for non-array input', () => {
      expect(isAiGeneratedNodeStructure('string')).toBe(false);
      expect(isAiGeneratedNodeStructure(123)).toBe(false);
      expect(isAiGeneratedNodeStructure({ data: 'not array' })).toBe(false);
      expect(isAiGeneratedNodeStructure(null)).toBe(false);
      expect(isAiGeneratedNodeStructure(undefined)).toBe(false);
    });

    it('should return false for empty array', () => {
      const result = isAiGeneratedNodeStructure([]);
      expect(result).toBe(false);
    });

    it('should return false for objects with wrong field names', () => {
      const invalidData = [
        {
          content: 'Wrong field name', // should be 'data'
          children: [],
        },
      ];

      const result = isAiGeneratedNodeStructure(invalidData);
      expect(result).toBe(false);
    });

    it('should return false for objects with non-string data field', () => {
      const invalidData = [
        {
          data: 123, // should be string
          children: [],
        },
      ];

      const result = isAiGeneratedNodeStructure(invalidData);
      expect(result).toBe(false);
    });

    it('should return false for objects with invalid children structure', () => {
      const invalidData = [
        {
          data: 'Valid data',
          children: [
            {
              content: 'Invalid child structure', // should be 'data'
            },
          ],
        },
      ];

      const result = isAiGeneratedNodeStructure(invalidData);
      expect(result).toBe(false);
    });

    it('should return false for objects with null values', () => {
      const invalidData = [
        null,
        {
          data: 'Valid node',
        },
      ];

      const result = isAiGeneratedNodeStructure(invalidData);
      expect(result).toBe(false);
    });

    it('should handle deeply nested valid structures', () => {
      const deepData: AiGeneratedNode[] = [
        {
          data: 'Level 1',
          children: [
            {
              data: 'Level 2',
              children: [
                {
                  data: 'Level 3',
                  children: [
                    {
                      data: 'Level 4',
                      children: [{ data: 'Level 5' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = isAiGeneratedNodeStructure(deepData);
      expect(result).toBe(true);
    });

    it('should return false for mixed valid and invalid nodes', () => {
      const mixedData = [
        {
          data: 'Valid node',
        },
        {
          content: 'Invalid node', // wrong field name
        },
      ];

      const result = isAiGeneratedNodeStructure(mixedData);
      expect(result).toBe(false);
    });
  });

  describe('convertAiDataToMindMapNodes', () => {
    const basePosition = { x: 100, y: 100 };

    it('should convert single root node without children', () => {
      const aiData: AiGeneratedNode[] = [{ data: 'Single Root' }];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);

      const rootNode = result.nodes[0];
      expect(rootNode.type).toBe(MINDMAP_TYPES.ROOT_NODE);
      expect(rootNode.position).toEqual(basePosition);
      expect(rootNode.data.content).toBe('<p>Single Root</p>');
      expect(rootNode.data.side).toBe(SIDE.MID);
      expect(rootNode.data.level).toBe(0);
      expect(rootNode.data.parentId).toBeUndefined();
      expect(rootNode.data.pathType).toBe(PATH_TYPES.SMOOTHSTEP);
      expect(rootNode.data.edgeColor).toBe('var(--primary)');
      expect(rootNode.dragHandle).toBeUndefined();
    });

    it('should convert root node with direct children', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'Root Topic',
          children: [{ data: 'Left Child' }, { data: 'Right Child' }],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);

      const rootNode = result.nodes[0];
      const leftChild = result.nodes.find((n) => n.data.content === '<p>Left Child</p>');
      const rightChild = result.nodes.find((n) => n.data.content === '<p>Right Child</p>');

      // Check root node
      expect(rootNode.type).toBe(MINDMAP_TYPES.ROOT_NODE);
      expect(rootNode.data.side).toBe(SIDE.MID);
      expect(rootNode.data.level).toBe(0);

      // Check children
      expect(leftChild).toBeDefined();
      expect(leftChild?.type).toBe(MINDMAP_TYPES.TEXT_NODE);
      expect(leftChild?.data.side).toBe(SIDE.LEFT);
      expect(leftChild?.data.level).toBe(1);
      expect(leftChild?.data.parentId).toBe(rootNode.id);
      expect(leftChild?.dragHandle).toBe(DRAGHANDLE.SELECTOR);

      expect(rightChild).toBeDefined();
      expect(rightChild?.type).toBe(MINDMAP_TYPES.TEXT_NODE);
      expect(rightChild?.data.side).toBe(SIDE.RIGHT);
      expect(rightChild?.data.level).toBe(1);
      expect(rightChild?.data.parentId).toBe(rootNode.id);

      // Check edges
      const leftEdge = result.edges.find((e) => e.target === leftChild?.id);
      const rightEdge = result.edges.find((e) => e.target === rightChild?.id);

      expect(leftEdge).toBeDefined();
      expect(leftEdge?.source).toBe(rootNode.id);
      expect(leftEdge?.type).toBe(MINDMAP_TYPES.EDGE);
      expect(leftEdge?.sourceHandle).toBe(`first-source-${rootNode.id}`);
      expect(leftEdge?.targetHandle).toBe(`second-target-${leftChild?.id}`);

      expect(rightEdge).toBeDefined();
      expect(rightEdge?.source).toBe(rootNode.id);
      expect(rightEdge?.sourceHandle).toBe(`second-source-${rootNode.id}`);
      expect(rightEdge?.targetHandle).toBe(`first-target-${rightChild?.id}`);
    });

    it('should handle deeply nested hierarchy', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'Root',
          children: [
            {
              data: 'Branch 1',
              children: [
                {
                  data: 'Leaf 1.1',
                  children: [{ data: 'Deep Leaf 1.1.1' }],
                },
              ],
            },
            {
              data: 'Branch 2',
              children: [{ data: 'Leaf 2.1' }, { data: 'Leaf 2.2' }],
            },
          ],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.nodes).toHaveLength(6);
      expect(result.edges).toHaveLength(5);

      // Check levels are correct
      const rootNode = result.nodes.find((n) => n.data.content === '<p>Root</p>');
      const branch1 = result.nodes.find((n) => n.data.content === '<p>Branch 1</p>');
      const leaf11 = result.nodes.find((n) => n.data.content === '<p>Leaf 1.1</p>');
      const deepLeaf = result.nodes.find((n) => n.data.content === '<p>Deep Leaf 1.1.1</p>');

      expect(rootNode?.data.level).toBe(0);
      expect(branch1?.data.level).toBe(1);
      expect(leaf11?.data.level).toBe(2);
      expect(deepLeaf?.data.level).toBe(3);

      // Check parent relationships
      expect(branch1?.data.parentId).toBe(rootNode?.id);
      expect(leaf11?.data.parentId).toBe(branch1?.id);
      expect(deepLeaf?.data.parentId).toBe(leaf11?.id);

      // Check sides are maintained in subtrees
      expect(branch1?.data.side).toBe(SIDE.LEFT);
      expect(leaf11?.data.side).toBe(SIDE.LEFT);
      expect(deepLeaf?.data.side).toBe(SIDE.LEFT);
    });

    it('should handle multiple root nodes', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'First Root',
          children: [{ data: 'Child 1' }],
        },
        {
          data: 'Second Root',
          children: [{ data: 'Child 2' }],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(2);

      const firstRoot = result.nodes.find((n) => n.data.content === '<p>First Root</p>');
      const secondRoot = result.nodes.find((n) => n.data.content === '<p>Second Root</p>');

      // Both should be root nodes
      expect(firstRoot?.type).toBe(MINDMAP_TYPES.ROOT_NODE);
      expect(secondRoot?.type).toBe(MINDMAP_TYPES.ROOT_NODE);

      // First root should have base position
      expect(firstRoot?.position).toEqual(basePosition);

      // Second root should have offset position
      expect(secondRoot?.position).toEqual({
        x: basePosition.x,
        y: basePosition.y + 200,
      });
    });

    it('should handle empty children arrays', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'Root with empty children',
          children: [],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);

      const rootNode = result.nodes[0];
      expect(rootNode.data.content).toBe('<p>Root with empty children</p>');
    });

    it('should generate unique IDs for all nodes and edges', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'Root',
          children: [{ data: 'Child 1' }, { data: 'Child 2' }],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      const nodeIds = result.nodes.map((n) => n.id);
      const edgeIds = result.edges.map((e) => e.id);

      // All node IDs should be unique
      expect(new Set(nodeIds).size).toBe(nodeIds.length);

      // All edge IDs should be unique
      expect(new Set(edgeIds).size).toBe(edgeIds.length);

      // Node and edge IDs should not overlap
      const allIds = [...nodeIds, ...edgeIds];
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    it('should set correct edge data properties', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'Root',
          children: [{ data: 'Child' }],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.edges).toHaveLength(1);

      const edge = result.edges[0];
      expect(edge.data?.strokeColor).toBe('var(--primary)');
      expect(edge.data?.strokeWidth).toBe(2);
      expect(edge.data?.pathType).toBe(PATH_TYPES.SMOOTHSTEP);
    });

    it('should handle single child node with correct positioning reference', () => {
      const aiData: AiGeneratedNode[] = [
        {
          data: 'Parent',
          children: [
            {
              data: 'Single Child',
              children: [{ data: 'Grandchild' }],
            },
          ],
        },
      ];

      const result = convertAiDataToMindMapNodes(aiData, basePosition);

      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);

      const child = result.nodes.find((n) => n.data.content === '<p>Single Child</p>');
      const grandchild = result.nodes.find((n) => n.data.content === '<p>Grandchild</p>');

      expect(child?.data.side).toBe(SIDE.LEFT);
      expect(grandchild?.data.side).toBe(SIDE.LEFT);
    });
  });
});
