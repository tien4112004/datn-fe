import { API_MODE, type ApiMode } from '@/shared/constants';
import { type MindmapApiService, type MindmapData, MINDMAP_TYPES, PATH_TYPES } from '../types';
import { DragHandle, SIDE } from '../types/constants';

const mockMindmaps: MindmapData[] = [
  {
    id: '1',
    title: 'Software Architecture',
    description: 'A mindmap exploring different software architecture patterns',
    nodes: [
      {
        id: 'root',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: '<p>Central Topic</p>',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
        },
        dragHandle: DragHandle.SELECTOR,
        width: 250,
        height: 100,
      },
      // Left side branch (going left from center)
      {
        id: 'left-1',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 250, y: 300 },
        data: {
          level: 1,
          content: '<p>Left Branch</p>',
          parentId: 'root',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
        dragHandle: DragHandle.SELECTOR,
        width: 400,
        height: 80,
      },
      {
        id: 'left-4',
        type: MINDMAP_TYPES.SHAPE_NODE,
        position: { x: 200, y: 400 },
        data: {
          level: 2,
          content: '<p>Left Shape Node</p>',
          parentId: 'left-1',
          shape: 'rectangle',
          metadata: {
            fill: 'lightblue',
            stroke: 'blue',
            strokeWidth: 2,
          },
          side: SIDE.LEFT,
          isCollapsed: false,
        },
        width: 300,
        height: 150,
      },
      {
        id: 'left-2',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 200, y: 200 },
        data: {
          level: 2,
          content: '<p>Left Child</p>',
          parentId: 'left-1',
          side: SIDE.LEFT,
          isCollapsed: false,
        },
        dragHandle: DragHandle.SELECTOR,
        width: 150,
        height: 60,
      },
      {
        id: 'right-1',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 550, y: 300 },
        data: {
          level: 1,
          content: '<p>Right Branch</p>',
          parentId: 'root',
          side: SIDE.RIGHT,
          isCollapsed: false,
        },
        dragHandle: DragHandle.SELECTOR,
        width: 200,
        height: 80,
      },
      {
        id: 'right-2',
        type: MINDMAP_TYPES.TEXT_NODE,
        position: { x: 600, y: 200 },
        data: {
          level: 2,
          content: '<p>Right Child</p>',
          parentId: 'right-1',
          side: SIDE.RIGHT,
          isCollapsed: false,
        },
        dragHandle: DragHandle.SELECTOR,
        width: 500,
        height: 60,
      },
      {
        id: 'right-3',
        type: MINDMAP_TYPES.SHAPE_NODE,
        position: { x: 600, y: 400 },
        data: {
          level: 2,
          content: '<p>Right Shape Node</p>',
          parentId: 'right-1',
          shape: 'circle',
          side: SIDE.RIGHT,
          isCollapsed: false,
        },
        width: 180,
        height: 150,
      },
    ],
    edges: [
      {
        id: 'e-root-left-1',
        source: 'root',
        target: 'left-1',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'first-source-root',
        targetHandle: 'second-target-left-1',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      },
      {
        id: 'e-left-1-left-4',
        source: 'left-1',
        target: 'left-4',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'first-source-left-1',
        targetHandle: 'second-target-left-4',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      },
      {
        id: 'e-left-1-left-2',
        source: 'left-1',
        target: 'left-2',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'first-source-left-1',
        targetHandle: 'second-target-left-2',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      },
      {
        id: 'e-root-right-1',
        source: 'root',
        target: 'right-1',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'second-source-root',
        targetHandle: 'first-target-right-1',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      },
      {
        id: 'e-right-1-right-2',
        source: 'right-1',
        target: 'right-2',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'second-source-right-1',
        targetHandle: 'first-target-right-2',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      },
      {
        id: 'e-right-1-right-3',
        source: 'right-1',
        target: 'right-3',
        type: MINDMAP_TYPES.EDGE,
        sourceHandle: 'second-source-right-1',
        targetHandle: 'first-target-right-3',
        data: {
          strokeColor: 'var(--primary)',
          strokeWidth: 2,
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  },
];

export default class MindmapMockService implements MindmapApiService {
  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getMindmapById(): Promise<MindmapData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mindmap = mockMindmaps[0];
        resolve({ ...mindmap });
      }, 300);
    });
  }
}
