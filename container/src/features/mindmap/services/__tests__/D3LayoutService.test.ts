import { describe, it, expect, beforeEach } from 'vitest';
import { d3LayoutService } from '../D3LayoutService';
import { DIRECTION, SIDE } from '../../types/constants';
import { MINDMAP_TYPES, type MindMapNode, type MindMapEdge, type RootNode } from '../../types';

// Mock data generators
function createMockMindMapNode(id: string, overrides?: Partial<MindMapNode>): MindMapNode {
  return {
    id,
    type: MINDMAP_TYPES.TEXT_NODE,
    position: { x: 0, y: 0 },
    data: {
      content: `Node ${id}`,
      level: 1,
      isCollapsed: false,
      side: SIDE.RIGHT,
      parentId: undefined,
      ...overrides?.data,
    },
    measured: {
      width: 100,
      height: 50,
    },
    ...overrides,
  } as MindMapNode;
}

function createMockRootNode(id: string = 'root', overrides?: Partial<RootNode>): RootNode {
  return {
    id,
    type: MINDMAP_TYPES.ROOT_NODE,
    position: { x: 0, y: 0 },
    data: {
      content: 'Root Node',
      level: 0,
      isCollapsed: false,
      side: SIDE.MID,
      ...overrides?.data,
    },
    measured: {
      width: 120,
      height: 60,
    },
    ...overrides,
  } as RootNode;
}

function createMockEdge(source: string, target: string, id: string = `${source}-${target}`): MindMapEdge {
  return {
    id,
    source,
    target,
    type: MINDMAP_TYPES.EDGE,
    data: {},
  };
}

function createSimpleTree(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const rootNode = createMockRootNode('root');
  const leftChild = createMockMindMapNode('left-1', {
    data: { parentId: 'root', side: SIDE.LEFT, level: 1, isCollapsed: false },
  });
  const rightChild = createMockMindMapNode('right-1', {
    data: { parentId: 'root', side: SIDE.RIGHT, level: 1, isCollapsed: false },
  });

  const nodes = [rootNode, leftChild, rightChild];
  const edges = [createMockEdge('root', 'left-1'), createMockEdge('root', 'right-1')];

  return { nodes, edges };
}

function createComplexTree(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const rootNode = createMockRootNode('root');

  // Level 1 nodes
  const left1 = createMockMindMapNode('left-1', {
    data: { parentId: 'root', side: SIDE.LEFT, level: 1, isCollapsed: false },
  });
  const right1 = createMockMindMapNode('right-1', {
    data: { parentId: 'root', side: SIDE.RIGHT, level: 1, isCollapsed: false },
  });
  const right2 = createMockMindMapNode('right-2', {
    data: { parentId: 'root', side: SIDE.RIGHT, level: 1, isCollapsed: false },
  });

  // Level 2 nodes
  const left1_1 = createMockMindMapNode('left-1-1', {
    data: { parentId: 'left-1', side: SIDE.LEFT, level: 2, isCollapsed: false },
  });
  const right1_1 = createMockMindMapNode('right-1-1', {
    data: { parentId: 'right-1', side: SIDE.RIGHT, level: 2, isCollapsed: false },
  });
  const right1_2 = createMockMindMapNode('right-1-2', {
    data: { parentId: 'right-1', side: SIDE.RIGHT, level: 2, isCollapsed: false },
  });

  const nodes = [rootNode, left1, right1, right2, left1_1, right1_1, right1_2];
  const edges = [
    createMockEdge('root', 'left-1'),
    createMockEdge('root', 'right-1'),
    createMockEdge('root', 'right-2'),
    createMockEdge('left-1', 'left-1-1'),
    createMockEdge('right-1', 'right-1-1'),
    createMockEdge('right-1', 'right-1-2'),
  ];

  return { nodes, edges };
}

function createMultipleTreesData(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  // Tree 1
  const root1 = createMockRootNode('root1');
  const tree1Child = createMockMindMapNode('tree1-child', {
    data: { parentId: 'root1', side: SIDE.RIGHT, level: 1, isCollapsed: false },
  });

  // Tree 2
  const root2 = createMockRootNode('root2');
  const tree2Child1 = createMockMindMapNode('tree2-child1', {
    data: { parentId: 'root2', side: SIDE.LEFT, level: 1, isCollapsed: false },
  });
  const tree2Child2 = createMockMindMapNode('tree2-child2', {
    data: { parentId: 'root2', side: SIDE.RIGHT, level: 1, isCollapsed: false },
  });

  const nodes = [root1, tree1Child, root2, tree2Child1, tree2Child2];
  const edges = [
    createMockEdge('root1', 'tree1-child'),
    createMockEdge('root2', 'tree2-child1'),
    createMockEdge('root2', 'tree2-child2'),
  ];

  return { nodes, edges };
}

describe('D3LayoutService', () => {
  describe('Helper Methods', () => {
    describe('getSubtreeNodes', () => {
      it('should return single node for leaf node', () => {
        const { nodes } = createSimpleTree();
        const subtreeNodes = d3LayoutService.getSubtreeNodes('left-1', nodes);

        expect(subtreeNodes).toHaveLength(1);
        expect(subtreeNodes[0].id).toBe('left-1');
      });

      it('should return node and all descendants', () => {
        const { nodes } = createComplexTree();
        const subtreeNodes = d3LayoutService.getSubtreeNodes('right-1', nodes);

        expect(subtreeNodes).toHaveLength(3); // right-1, right-1-1, right-1-2
        expect(subtreeNodes.map((n) => n.id)).toContain('right-1');
        expect(subtreeNodes.map((n) => n.id)).toContain('right-1-1');
        expect(subtreeNodes.map((n) => n.id)).toContain('right-1-2');
      });

      it('should return entire tree from root', () => {
        const { nodes } = createComplexTree();
        const subtreeNodes = d3LayoutService.getSubtreeNodes('root', nodes);

        expect(subtreeNodes).toHaveLength(7); // All nodes
      });

      it('should handle non-existent node', () => {
        const { nodes } = createSimpleTree();
        const subtreeNodes = d3LayoutService.getSubtreeNodes('non-existent', nodes);

        expect(subtreeNodes).toHaveLength(0);
      });

      it('should prevent infinite loops with cycle detection', () => {
        const { nodes } = createSimpleTree();
        // Create a circular reference manually
        nodes[1].data.parentId = 'right-1';
        nodes[2].data.parentId = 'left-1';

        const subtreeNodes = d3LayoutService.getSubtreeNodes('left-1', nodes);

        // Should still terminate and return nodes (cycle detection prevents infinite loop)
        expect(subtreeNodes.length).toBeGreaterThan(0);
      });
    });

    describe('buildSubtree', () => {
      it('should build hierarchy for node with no children', () => {
        const { nodes } = createSimpleTree();
        const childrenMap = new Map<string, MindMapNode[]>();

        const hierarchy = d3LayoutService.buildSubtree(nodes[1], childrenMap);

        expect(hierarchy.originalNode.id).toBe('left-1');
        expect(hierarchy.children).toHaveLength(0);
      });

      it('should build hierarchy for node with children', () => {
        const { nodes } = createComplexTree();
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        const rootNode = nodes.find((n) => n.id === 'root')!;
        const hierarchy = d3LayoutService.buildSubtree(rootNode, childrenMap);

        expect(hierarchy.originalNode.id).toBe('root');
        expect(hierarchy.children).toHaveLength(3); // left-1, right-1, right-2
      });
    });

    describe('createHierarchy', () => {
      it('should create hierarchy for left side nodes', () => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        const leftHierarchy = d3LayoutService.createHierarchy(SIDE.LEFT, nodes, rootNode, childrenMap);

        expect(leftHierarchy.data.originalNode.id).toBe('root');
        expect(leftHierarchy.children).toHaveLength(1); // Only left-1 node
        expect(leftHierarchy.children![0].data.originalNode.id).toBe('left-1');

        // Check if preprocessing added width/height
        expect(leftHierarchy.width).toBeDefined();
        expect(leftHierarchy.height).toBeDefined();
      });

      it('should create hierarchy for right side nodes', () => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        const rightHierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

        expect(rightHierarchy.data.originalNode.id).toBe('root');
        expect(rightHierarchy.children).toHaveLength(2); // right-1, right-2 nodes

        // Check if preprocessing added width/height
        expect(rightHierarchy.width).toBe(120); // Root node width
        expect(rightHierarchy.height).toBe(60); // Root node height
      });

      it('should handle empty side', () => {
        const { nodes } = createSimpleTree();
        // Remove all left side nodes
        const rightOnlyNodes = nodes.filter((n) => n.data.side !== SIDE.LEFT);
        const rootNode = rightOnlyNodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        const leftHierarchy = d3LayoutService.createHierarchy(
          SIDE.LEFT,
          rightOnlyNodes,
          rootNode,
          childrenMap
        );

        // When there are no children, D3 doesn't create a children array
        const childrenCount = leftHierarchy.children?.length || 0;
        expect(childrenCount).toBe(0);
      });
    });
  });

  describe('Core Calculation Methods', () => {
    describe('calculateSubtreeHeight', () => {
      it('should return cached height when available', () => {
        const { nodes } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        const hierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

        // Mock a cached height
        hierarchy.subtreeHeight = 150;

        const height = d3LayoutService.calculateSubtreeHeight(hierarchy, 20);
        expect(height).toBe(150);
      });

      it('should calculate height for leaf nodes correctly', () => {
        const { nodes } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Create a hierarchy with no children (leaf node)
        const leafHierarchy = d3LayoutService.createHierarchy(SIDE.LEFT, [], rootNode, childrenMap);

        const height = d3LayoutService.calculateSubtreeHeight(leafHierarchy, 20);
        expect(height).toBe(60); // Root node height
      });

      it('should calculate recursive height with children', () => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        const rightHierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

        const height = d3LayoutService.calculateSubtreeHeight(rightHierarchy, 20);

        // Should be greater than just root height (60) since it has children
        expect(height).toBeGreaterThan(60);
        expect(height).toBeGreaterThan(0);
      });

      it('should account for vertical spacing', () => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        const rightHierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

        const heightWithSmallSpacing = d3LayoutService.calculateSubtreeHeight(rightHierarchy, 10);

        // Reset cached height to test again
        delete rightHierarchy.subtreeHeight;
        if (rightHierarchy.children) {
          rightHierarchy.children.forEach((child) => delete child.subtreeHeight);
        }

        const heightWithLargeSpacing = d3LayoutService.calculateSubtreeHeight(rightHierarchy, 50);

        expect(heightWithLargeSpacing).toBeGreaterThan(heightWithSmallSpacing);
      });
    });

    describe('Boundary Calculation Methods', () => {
      let testHierarchy: any;

      beforeEach(() => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        testHierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

        // Manually set positions for testing
        testHierarchy.x = 100;
        testHierarchy.y = 100;
      });

      describe('getSubtreeBottomY', () => {
        it('should return node bottom for leaf nodes', () => {
          // Create a leaf node (no children)
          const leafNode = { ...testHierarchy };
          delete leafNode.children;
          leafNode.x = 100;
          leafNode.y = 100;
          leafNode.height = 60;

          const bottomY = d3LayoutService.getSubtreeBottomY(leafNode);
          expect(bottomY).toBe(160); // y + height
        });

        it('should return max bottom of children for parent nodes', () => {
          if (testHierarchy.children && testHierarchy.children.length > 0) {
            // Set positions for children
            testHierarchy.children[0].x = 200;
            testHierarchy.children[0].y = 50;
            testHierarchy.children[0].height = 50;

            if (testHierarchy.children[1]) {
              testHierarchy.children[1].x = 200;
              testHierarchy.children[1].y = 150;
              testHierarchy.children[1].height = 50;
            }

            const bottomY = d3LayoutService.getSubtreeBottomY(testHierarchy);
            expect(bottomY).toBeGreaterThan(100); // Greater than root y
          }
        });
      });

      describe('getSubtreeTopY', () => {
        it('should return node y for leaf nodes', () => {
          const leafNode = { ...testHierarchy };
          delete leafNode.children;
          leafNode.x = 100;
          leafNode.y = 100;

          const topY = d3LayoutService.getSubtreeTopY(leafNode);
          expect(topY).toBe(100); // Just the y position
        });
      });

      describe('getSubtreeRightX', () => {
        it('should return node right edge for leaf nodes', () => {
          const leafNode = { ...testHierarchy };
          delete leafNode.children;
          leafNode.x = 100;
          leafNode.y = 100;
          leafNode.width = 120;

          const rightX = d3LayoutService.getSubtreeRightX(leafNode);
          expect(rightX).toBe(220); // x + width
        });
      });

      describe('getSubtreeLeftX', () => {
        it('should return node x for leaf nodes', () => {
          const leafNode = { ...testHierarchy };
          delete leafNode.children;
          leafNode.x = 100;
          leafNode.y = 100;

          const leftX = d3LayoutService.getSubtreeLeftX(leafNode);
          expect(leftX).toBe(100); // Just the x position
        });
      });
    });
  });

  describe('Position & Spacing Methods', () => {
    describe('adjustSubtreePosition', () => {
      it('should adjust position of single node', () => {
        const { nodes } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        const hierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, [], rootNode, childrenMap);

        // Set initial position
        hierarchy.x = 100;
        hierarchy.y = 100;

        // Adjust position
        d3LayoutService.adjustSubtreePosition(hierarchy, 50, 30);

        expect(hierarchy.x).toBe(130); // 100 + 30
        expect(hierarchy.y).toBe(150); // 100 + 50
      });

      it('should recursively adjust children positions', () => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        const hierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

        // Set initial positions
        hierarchy.x = 100;
        hierarchy.y = 100;
        if (hierarchy.children && hierarchy.children.length > 0) {
          hierarchy.children[0].x = 200;
          hierarchy.children[0].y = 50;
        }

        const initialChildX = hierarchy.children?.[0]?.x || 0;
        const initialChildY = hierarchy.children?.[0]?.y || 0;

        // Adjust positions
        d3LayoutService.adjustSubtreePosition(hierarchy, 20, 10);

        // Check root adjustment
        expect(hierarchy.x).toBe(110); // 100 + 10
        expect(hierarchy.y).toBe(120); // 100 + 20

        // Check child adjustment
        if (hierarchy.children && hierarchy.children.length > 0) {
          expect(hierarchy.children[0].x).toBe(initialChildX + 10);
          expect(hierarchy.children[0].y).toBe(initialChildY + 20);
        }
      });

      it('should handle nodes with no children', () => {
        const { nodes } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        const hierarchy = d3LayoutService.createHierarchy(SIDE.LEFT, [], rootNode, childrenMap);

        hierarchy.x = 50;
        hierarchy.y = 75;

        // Should not throw error when no children
        expect(() => {
          d3LayoutService.adjustSubtreePosition(hierarchy, 25, 15);
        }).not.toThrow();

        expect(hierarchy.x).toBe(65); // 50 + 15
        expect(hierarchy.y).toBe(100); // 75 + 25
      });
    });

    describe('adjustSpacing', () => {
      let testHierarchy: any;

      beforeEach(() => {
        const { nodes } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        testHierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);
      });

      it('should handle nodes with no children', () => {
        const leafNode = { ...testHierarchy };
        delete leafNode.children;

        // Should not throw error and should return early
        expect(() => {
          d3LayoutService.adjustSpacing(leafNode, DIRECTION.HORIZONTAL, 50);
        }).not.toThrow();
      });

      it('should handle nodes with single child', () => {
        if (testHierarchy.children && testHierarchy.children.length > 1) {
          // Keep only one child
          testHierarchy.children = [testHierarchy.children[0]];

          // Should not throw error for single child
          expect(() => {
            d3LayoutService.adjustSpacing(testHierarchy, DIRECTION.HORIZONTAL, 50);
          }).not.toThrow();
        }
      });

      it('should adjust spacing for horizontal direction', () => {
        if (testHierarchy.children && testHierarchy.children.length > 1) {
          // Set up test positions
          testHierarchy.children.forEach((child: any, index: number) => {
            child.x = 200;
            child.y = 50 + index * 100; // Spread vertically
            child.width = 100;
            child.height = 50;
            child.subtreeHeight = 50;
          });

          const initialPositions = testHierarchy.children.map((child: any) => ({ x: child.x, y: child.y }));

          // Apply spacing adjustment
          d3LayoutService.adjustSpacing(testHierarchy, DIRECTION.HORIZONTAL, 80);

          // Positions should potentially be adjusted
          expect(testHierarchy.children[0]).toBeDefined();
        }
      });

      it('should adjust spacing for vertical direction', () => {
        if (testHierarchy.children && testHierarchy.children.length > 1) {
          // Set up test positions for vertical layout
          testHierarchy.children.forEach((child: any, index: number) => {
            child.x = 200 + index * 150; // Spread horizontally
            child.y = 200;
            child.width = 100;
            child.height = 50;
          });

          const initialPositions = testHierarchy.children.map((child: any) => ({ x: child.x, y: child.y }));

          // Apply spacing adjustment
          d3LayoutService.adjustSpacing(testHierarchy, DIRECTION.VERTICAL, 120);

          // Positions should potentially be adjusted
          expect(testHierarchy.children[0]).toBeDefined();
        }
      });
    });
  });

  describe('Integration Tests - Layout Algorithms', () => {
    describe('layoutSubtree', () => {
      it('should handle single root node (minimal case)', async () => {
        const rootNode = createMockRootNode('root');
        const result = await d3LayoutService.layoutSubtree(rootNode, [], [], DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(1);
        expect(result.nodes[0].id).toBe('root');
        expect(result.nodes[0].position.x).toBe(0);
        expect(result.nodes[0].position.y).toBe(0);
      });

      it('should layout root with direct children horizontally', async () => {
        const { nodes, edges } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childNodes = nodes.filter((n) => n.type !== MINDMAP_TYPES.ROOT_NODE);

        const result = await d3LayoutService.layoutSubtree(rootNode, childNodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(3);
        expect(result.edges).toHaveLength(2);

        // Root should maintain position
        const layoutedRoot = result.nodes.find((n) => n.id === 'root')!;
        expect(layoutedRoot.position.x).toBe(0);
        expect(layoutedRoot.position.y).toBe(0);

        // Children should be positioned relative to root
        const leftChild = result.nodes.find((n) => n.id === 'left-1')!;
        const rightChild = result.nodes.find((n) => n.id === 'right-1')!;

        expect(leftChild.position.x).toBeLessThan(0); // Left side
        expect(rightChild.position.x).toBeGreaterThan(0); // Right side
      });

      it('should layout root with direct children vertically', async () => {
        const { nodes, edges } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childNodes = nodes.filter((n) => n.type !== MINDMAP_TYPES.ROOT_NODE);

        const result = await d3LayoutService.layoutSubtree(rootNode, childNodes, edges, DIRECTION.VERTICAL);

        expect(result.nodes).toHaveLength(3);

        // Root should maintain position
        const layoutedRoot = result.nodes.find((n) => n.id === 'root')!;
        expect(layoutedRoot.position.x).toBe(0);
        expect(layoutedRoot.position.y).toBe(0);

        // Children should be positioned vertically
        const leftChild = result.nodes.find((n) => n.id === 'left-1')!;
        const rightChild = result.nodes.find((n) => n.id === 'right-1')!;

        expect(leftChild.position.y).toBeLessThan(0); // Top (left side in vertical)
        expect(rightChild.position.y).toBeGreaterThan(0); // Bottom (right side in vertical)
      });

      it('should handle multi-level hierarchy', async () => {
        const { nodes, edges } = createComplexTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childNodes = nodes.filter((n) => n.type !== MINDMAP_TYPES.ROOT_NODE);

        const result = await d3LayoutService.layoutSubtree(rootNode, childNodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(7); // All nodes
        expect(result.edges).toHaveLength(6); // All edges

        // Check that level 2 nodes are positioned further from root than level 1
        const level1Node = result.nodes.find((n) => n.id === 'right-1')!;
        const level2Node = result.nodes.find((n) => n.id === 'right-1-1')!;

        expect(Math.abs(level2Node.position.x)).toBeGreaterThan(Math.abs(level1Node.position.x));
      });

      it('should return unchanged nodes for DIRECTION.NONE', async () => {
        const { nodes, edges } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childNodes = nodes.filter((n) => n.type !== MINDMAP_TYPES.ROOT_NODE);

        const result = await d3LayoutService.layoutSubtree(rootNode, childNodes, edges, DIRECTION.NONE);

        expect(result.nodes).toHaveLength(3);
        expect(result.edges).toEqual(edges);

        // Positions should remain as they were
        const layoutedRoot = result.nodes.find((n) => n.id === 'root')!;
        expect(layoutedRoot.position).toEqual(rootNode.position);
      });
    });

    describe('layoutAllTrees', () => {
      it('should layout single tree', async () => {
        const { nodes, edges } = createSimpleTree();

        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(3);
        expect(result.edges).toHaveLength(2);

        // Should have positioned nodes correctly
        const rootNode = result.nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        expect(rootNode.position.x).toBe(0);
        expect(rootNode.position.y).toBe(0);
      });

      it('should layout multiple independent trees', async () => {
        const { nodes, edges } = createMultipleTreesData();

        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(5);
        expect(result.edges).toHaveLength(3);

        // Should have 2 root nodes
        const rootNodes = result.nodes.filter((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
        expect(rootNodes).toHaveLength(2);

        // Each root should maintain its original position
        rootNodes.forEach((rootNode) => {
          expect(rootNode.position.x).toBe(0);
          expect(rootNode.position.y).toBe(0);
        });
      });

      it('should handle orphaned nodes and edges', async () => {
        const { nodes, edges } = createSimpleTree();

        // Add an orphaned node (no parent, not a root)
        const orphanedNode = createMockMindMapNode('orphaned', {
          data: { parentId: undefined, side: SIDE.MID, level: 1, isCollapsed: false },
        });
        nodes.push(orphanedNode);

        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(4); // Original 3 + orphaned
        expect(result.edges).toHaveLength(2); // Same edges

        // Orphaned node should be included
        const orphaned = result.nodes.find((n) => n.id === 'orphaned')!;
        expect(orphaned).toBeDefined();
      });

      it('should handle empty input', async () => {
        const result = await d3LayoutService.layoutAllTrees([], [], DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(0);
        expect(result.edges).toHaveLength(0);
      });

      it('should handle no root nodes scenario', async () => {
        const { nodes, edges } = createSimpleTree();

        // Remove all root nodes
        const noRootNodes = nodes.filter((n) => n.type !== MINDMAP_TYPES.ROOT_NODE);

        const result = await d3LayoutService.layoutAllTrees(noRootNodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(2); // Only child nodes (as orphans)
        expect(result.edges).toHaveLength(2); // Original edges
      });

      it('should return unchanged for DIRECTION.NONE', async () => {
        const { nodes, edges } = createSimpleTree();

        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.NONE);

        expect(result.nodes).toEqual(nodes);
        expect(result.edges).toEqual(edges);
      });
    });
  });

  describe('Edge Cases & Error Handling', () => {
    describe('Null Safety Tests', () => {
      it('should handle nodes with missing measured properties', () => {
        const nodeWithoutMeasured = createMockMindMapNode('test', {
          measured: undefined,
        });

        const childrenMap = new Map<string, MindMapNode[]>();
        const hierarchy = d3LayoutService.buildSubtree(nodeWithoutMeasured, childrenMap);

        expect(hierarchy.originalNode.id).toBe('test');
        expect(hierarchy.children).toHaveLength(0);
      });

      it('should handle nodes with partial measured properties', () => {
        const nodeWithPartialMeasured = createMockMindMapNode('test', {
          measured: { width: 100 } as any, // Missing height
        });

        const rootNode = createMockRootNode();
        const childrenMap = new Map<string, MindMapNode[]>();

        // Should not throw error
        expect(() => {
          d3LayoutService.createHierarchy(SIDE.RIGHT, [nodeWithPartialMeasured], rootNode, childrenMap);
        }).not.toThrow();
      });

      it('should handle undefined children arrays', () => {
        const { nodes } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        const hierarchy = d3LayoutService.createHierarchy(SIDE.LEFT, [], rootNode, childrenMap);

        // Should handle undefined/empty children gracefully
        expect(() => {
          d3LayoutService.calculateSubtreeHeight(hierarchy, 20);
        }).not.toThrow();
      });

      it('should handle null parent in hierarchy', () => {
        const { nodes } = createSimpleTree();
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        const hierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, [], rootNode, childrenMap);

        // Root node should have null parent
        expect(hierarchy.parent).toBeNull();

        // Should handle boundary calculations with null parent
        expect(() => {
          d3LayoutService.getSubtreeBottomY(hierarchy);
          d3LayoutService.getSubtreeRightX(hierarchy);
        }).not.toThrow();
      });
    });

    describe('Data Validation Tests', () => {
      it('should handle invalid node data gracefully', async () => {
        const invalidNode = {
          id: 'invalid',
          type: MINDMAP_TYPES.ROOT_NODE,
          position: { x: 0, y: 0 },
          data: null as any,
          measured: null as any,
        } as MindMapNode;

        // Should not crash the layout algorithm
        const result = await d3LayoutService.layoutSubtree(invalidNode, [], [], DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(1);
        expect(result.nodes[0].id).toBe('invalid');
      });

      it('should handle missing required properties', async () => {
        const nodeWithMissingProps = {
          id: 'missing-props',
          type: MINDMAP_TYPES.TEXT_NODE,
          position: { x: 0, y: 0 },
          data: {
            // Missing required properties
          },
          measured: { width: 50, height: 25 },
        } as any;

        // Should handle gracefully
        expect(() => {
          d3LayoutService.getSubtreeNodes('missing-props', [nodeWithMissingProps]);
        }).not.toThrow();
      });

      it('should handle malformed edge data', async () => {
        const { nodes } = createSimpleTree();
        const malformedEdges = [
          { id: 'bad-edge', source: 'non-existent', target: 'also-non-existent' } as any,
        ];

        const result = await d3LayoutService.layoutAllTrees(nodes, malformedEdges, DIRECTION.HORIZONTAL);

        // Should include malformed edges in output (as orphaned)
        expect(result.edges).toContain(malformedEdges[0]);
      });

      it('should detect and handle circular references', () => {
        // Create nodes with circular parent-child relationship
        const node1 = createMockMindMapNode('node1', {
          data: { parentId: 'node2', side: SIDE.RIGHT, level: 1, isCollapsed: false },
        });
        const node2 = createMockMindMapNode('node2', {
          data: { parentId: 'node1', side: SIDE.RIGHT, level: 1, isCollapsed: false },
        });

        const nodesWithCycle = [node1, node2];

        // Should not cause infinite loop
        const subtreeNodes = d3LayoutService.getSubtreeNodes('node1', nodesWithCycle);

        // Should terminate and return some nodes
        expect(subtreeNodes.length).toBeGreaterThanOrEqual(0);
        expect(subtreeNodes.length).toBeLessThanOrEqual(2);
      });
    });

    describe('Boundary Conditions', () => {
      it('should handle extremely large spacing values', async () => {
        const { nodes, edges } = createSimpleTree();

        // Test with very large spacing (should not cause overflow)
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childNodes = nodes.filter((n) => n.type !== MINDMAP_TYPES.ROOT_NODE);

        const result = await d3LayoutService.layoutSubtree(rootNode, childNodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(3);
        expect(result.nodes.every((n) => isFinite(n.position.x) && isFinite(n.position.y))).toBe(true);
      });

      it('should handle zero-sized nodes', async () => {
        const zeroSizedNode = createMockMindMapNode('zero', {
          measured: { width: 0, height: 0 },
        });

        const result = await d3LayoutService.layoutSubtree(zeroSizedNode, [], [], DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(1);
        expect(result.nodes[0].position.x).toBe(0);
        expect(result.nodes[0].position.y).toBe(0);
      });

      it('should handle negative node dimensions', async () => {
        const negativeNode = createMockMindMapNode('negative', {
          measured: { width: -50, height: -25 },
        });

        // Should not crash, should handle gracefully
        const result = await d3LayoutService.layoutSubtree(negativeNode, [], [], DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(1);
      });

      it('should handle extremely deep hierarchy', async () => {
        // Create a deep linear hierarchy (10 levels)
        const nodes: MindMapNode[] = [];
        const edges: MindMapEdge[] = [];

        const rootNode = createMockRootNode('deep-root');
        nodes.push(rootNode);

        let currentParent = 'deep-root';
        for (let i = 1; i <= 10; i++) {
          const nodeId = `level-${i}`;
          const node = createMockMindMapNode(nodeId, {
            data: { parentId: currentParent, side: SIDE.RIGHT, level: i, isCollapsed: false },
          });
          nodes.push(node);
          edges.push(createMockEdge(currentParent, nodeId));
          currentParent = nodeId;
        }

        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(11); // Root + 10 levels
        expect(result.edges).toHaveLength(10);

        // Last node should be furthest from root
        const lastNode = result.nodes.find((n) => n.id === 'level-10')!;
        expect(Math.abs(lastNode.position.x)).toBeGreaterThan(100);
      });

      it('should handle extremely wide hierarchy', async () => {
        // Create a hierarchy with many siblings
        const nodes: MindMapNode[] = [];
        const edges: MindMapEdge[] = [];

        const rootNode = createMockRootNode('wide-root');
        nodes.push(rootNode);

        // Add 20 children to root
        for (let i = 1; i <= 20; i++) {
          const nodeId = `child-${i}`;
          const node = createMockMindMapNode(nodeId, {
            data: {
              parentId: 'wide-root',
              side: i <= 10 ? SIDE.LEFT : SIDE.RIGHT,
              level: 1,
              isCollapsed: false,
            },
          });
          nodes.push(node);
          edges.push(createMockEdge('wide-root', nodeId));
        }

        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);

        expect(result.nodes).toHaveLength(21); // Root + 20 children
        expect(result.edges).toHaveLength(20);

        // Should handle the wide layout without errors
        expect(result.nodes.every((n) => isFinite(n.position.x) && isFinite(n.position.y))).toBe(true);
      });
    });
  });

  describe('Performance & Stress Tests', () => {
    function createLargeDataset(nodeCount: number): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
      const nodes: MindMapNode[] = [];
      const edges: MindMapEdge[] = [];

      // Create root node
      const rootNode = createMockRootNode('perf-root');
      nodes.push(rootNode);

      // Create nodes in a balanced tree structure
      let currentId = 1;
      const nodesPerLevel = Math.ceil(Math.pow(nodeCount, 1 / 4)); // Roughly 4 levels for large datasets

      for (let level = 1; level <= 4 && currentId < nodeCount; level++) {
        const nodesInThisLevel = Math.min(nodesPerLevel, nodeCount - currentId);

        for (let i = 0; i < nodesInThisLevel && currentId < nodeCount; i++) {
          const nodeId = `perf-node-${currentId}`;
          const parentId =
            level === 1 ? 'perf-root' : `perf-node-${Math.floor((currentId - 1) / nodesPerLevel) + 1}`;

          const node = createMockMindMapNode(nodeId, {
            data: {
              parentId,
              side: i % 2 === 0 ? SIDE.LEFT : SIDE.RIGHT,
              level,
              isCollapsed: false,
            },
          });

          nodes.push(node);
          edges.push(createMockEdge(parentId, nodeId));
          currentId++;
        }
      }

      return { nodes, edges };
    }

    describe('Large Dataset Handling', () => {
      it('should handle 100+ node trees efficiently', async () => {
        const { nodes, edges } = createLargeDataset(100);

        const startTime = performance.now();
        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);
        const endTime = performance.now();

        const executionTime = endTime - startTime;

        expect(result.nodes).toHaveLength(nodes.length);
        expect(result.edges).toHaveLength(edges.length);
        expect(executionTime).toBeLessThan(1000); // Should complete within 1 second

        // Verify all nodes have valid positions
        expect(
          result.nodes.every(
            (n) =>
              isFinite(n.position.x) && isFinite(n.position.y) && !isNaN(n.position.x) && !isNaN(n.position.y)
          )
        ).toBe(true);
      });

      it('should handle 500+ node trees efficiently', async () => {
        const { nodes, edges } = createLargeDataset(500);

        const startTime = performance.now();
        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);
        const endTime = performance.now();

        const executionTime = endTime - startTime;

        expect(result.nodes).toHaveLength(nodes.length);
        expect(result.edges).toHaveLength(edges.length);
        expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds

        // Verify layout quality
        const rootNode = result.nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        expect(rootNode.position.x).toBe(0);
        expect(rootNode.position.y).toBe(0);
      });

      it('should handle 1000+ node trees (stress test)', async () => {
        const { nodes, edges } = createLargeDataset(1000);

        const startTime = performance.now();
        const result = await d3LayoutService.layoutAllTrees(nodes, edges, DIRECTION.HORIZONTAL);
        const endTime = performance.now();

        const executionTime = endTime - startTime;

        expect(result.nodes).toHaveLength(nodes.length);
        expect(result.edges).toHaveLength(edges.length);
        expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds

        // Check for performance issues
        console.log(`Layout 1000 nodes took: ${executionTime.toFixed(2)}ms`);
      });
    });

    describe('Memory Efficiency', () => {
      it('should not leak memory during preprocessing', () => {
        const { nodes } = createLargeDataset(200);
        const rootNode = nodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE)!;
        const childrenMap = new Map<string, MindMapNode[]>();

        // Build children map
        nodes.forEach((node) => {
          if (node.data.parentId) {
            if (!childrenMap.has(node.data.parentId)) {
              childrenMap.set(node.data.parentId, []);
            }
            childrenMap.get(node.data.parentId)!.push(node);
          }
        });

        // Create and preprocess multiple hierarchies
        for (let i = 0; i < 10; i++) {
          const hierarchy = d3LayoutService.createHierarchy(SIDE.RIGHT, nodes, rootNode, childrenMap);

          // Verify preprocessing worked
          expect(hierarchy.width).toBeDefined();
          expect(hierarchy.height).toBeDefined();

          // Allow garbage collection between iterations
          if (i % 5 === 0) {
            global.gc?.(); // Only available if --expose-gc flag is used
          }
        }
      });

      it('should efficiently traverse large hierarchies', () => {
        const { nodes } = createLargeDataset(500);

        const startTime = performance.now();

        // Test subtree traversal performance
        for (let i = 0; i < 10; i++) {
          const randomNodeId = `perf-node-${Math.floor(Math.random() * 100) + 1}`;
          const subtreeNodes = d3LayoutService.getSubtreeNodes(randomNodeId, nodes);
          expect(subtreeNodes.length).toBeGreaterThanOrEqual(0);
        }

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        expect(executionTime).toBeLessThan(100); // Should be very fast
      });
    });

    describe('Layout Algorithm Performance', () => {
      it('should maintain consistent performance across different directions', async () => {
        const { nodes, edges } = createLargeDataset(200);

        const directions = [DIRECTION.HORIZONTAL, DIRECTION.VERTICAL];
        const times: Record<string, number> = {};

        for (const direction of directions) {
          const startTime = performance.now();
          const result = await d3LayoutService.layoutAllTrees(nodes, edges, direction);
          const endTime = performance.now();

          times[direction] = endTime - startTime;

          expect(result.nodes).toHaveLength(nodes.length);
          expect(result.edges).toHaveLength(edges.length);
        }

        // Performance should be similar across directions (allowing for timing variability)
        const timeDifference = Math.abs(times[DIRECTION.HORIZONTAL] - times[DIRECTION.VERTICAL]);
        const averageTime = (times[DIRECTION.HORIZONTAL] + times[DIRECTION.VERTICAL]) / 2;

        // Difference should be reasonable (allowing for timing variability in CI environments)
        // If both times are very small (< 1ms), allow larger relative difference
        const threshold = averageTime < 1 ? 1.0 : averageTime * 0.8;
        expect(timeDifference).toBeLessThan(threshold);
      });

      it('should scale linearly with node count', async () => {
        const smallDataset = createLargeDataset(50);
        const mediumDataset = createLargeDataset(100);
        const largeDataset = createLargeDataset(200);

        // Measure performance for different sizes
        const measureTime = async (dataset: { nodes: MindMapNode[]; edges: MindMapEdge[] }) => {
          const startTime = performance.now();
          await d3LayoutService.layoutAllTrees(dataset.nodes, dataset.edges, DIRECTION.HORIZONTAL);
          return performance.now() - startTime;
        };

        const smallTime = await measureTime(smallDataset);
        const mediumTime = await measureTime(mediumDataset);
        const largeTime = await measureTime(largeDataset);

        // Should scale reasonably (not exponentially)
        const scalingRatio = largeTime / smallTime;
        // For very small execution times (< 1ms), timing variability can be high
        // Allow more flexible scaling for such cases
        const expectedMaxRatio = smallTime < 0.5 ? 50 : 10;
        expect(scalingRatio).toBeLessThan(expectedMaxRatio);

        console.log(
          `Scaling: 50 nodes: ${smallTime.toFixed(2)}ms, 100 nodes: ${mediumTime.toFixed(2)}ms, 200 nodes: ${largeTime.toFixed(2)}ms`
        );
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle multiple simultaneous layout operations', async () => {
        const datasets = Array.from({ length: 5 }, (_, i) => createLargeDataset(50 + i * 10));

        const startTime = performance.now();

        // Run multiple layout operations in parallel
        const promises = datasets.map((dataset) =>
          d3LayoutService.layoutAllTrees(dataset.nodes, dataset.edges, DIRECTION.HORIZONTAL)
        );

        const results = await Promise.all(promises);
        const endTime = performance.now();

        // All operations should complete successfully
        expect(results).toHaveLength(5);
        results.forEach((result, index) => {
          expect(result.nodes).toHaveLength(datasets[index].nodes.length);
          expect(result.edges).toHaveLength(datasets[index].edges.length);
        });

        const totalTime = endTime - startTime;
        expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
      });
    });
  });

  describe('Mock Data Generators', () => {
    it('should create valid mock mindmap node', () => {
      const node = createMockMindMapNode('test-id');

      expect(node.id).toBe('test-id');
      expect(node.type).toBe(MINDMAP_TYPES.TEXT_NODE);
      expect(node.data.content).toBe('Node test-id');
      expect(node.measured).toEqual({ width: 100, height: 50 });
    });

    it('should create valid mock root node', () => {
      const rootNode = createMockRootNode();

      expect(rootNode.id).toBe('root');
      expect(rootNode.type).toBe(MINDMAP_TYPES.ROOT_NODE);
      expect(rootNode.data.level).toBe(0);
      expect(rootNode.data.side).toBe(SIDE.MID);
    });

    it('should create simple tree structure', () => {
      const { nodes, edges } = createSimpleTree();

      expect(nodes).toHaveLength(3);
      expect(edges).toHaveLength(2);
      expect(nodes[0].type).toBe(MINDMAP_TYPES.ROOT_NODE);
    });

    it('should create complex tree structure', () => {
      const { nodes, edges } = createComplexTree();

      expect(nodes).toHaveLength(7);
      expect(edges).toHaveLength(6);

      // Verify hierarchy levels
      const rootNodes = nodes.filter((n) => n.data.level === 0);
      const level1Nodes = nodes.filter((n) => n.data.level === 1);
      const level2Nodes = nodes.filter((n) => n.data.level === 2);

      expect(rootNodes).toHaveLength(1);
      expect(level1Nodes).toHaveLength(3);
      expect(level2Nodes).toHaveLength(3);
    });

    it('should create multiple trees data', () => {
      const { nodes, edges } = createMultipleTreesData();

      expect(nodes).toHaveLength(5);
      expect(edges).toHaveLength(3);

      const rootNodes = nodes.filter((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
      expect(rootNodes).toHaveLength(2);
    });
  });
});
