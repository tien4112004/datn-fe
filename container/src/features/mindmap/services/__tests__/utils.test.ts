import { describe, it, expect } from 'vitest';
import { getAllDescendantNodes, getRootNodeOfSubtree } from '../utils';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../../types';
import type { MindMapNode } from '../../types';

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
});
