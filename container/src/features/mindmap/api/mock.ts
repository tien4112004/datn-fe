import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type MindmapApiService,
  type MindmapData,
  type MindmapCollectionRequest,
  MINDMAP_TYPES,
  PATH_TYPES,
} from '../types';
import { DRAGHANDLE, SIDE } from '../types/constants';
import type { ApiResponse, Pagination } from '@/shared/types/api';
import { mapPagination } from '@/shared/types/api';

const mockMindmaps: MindmapData[] = [
  {
    id: '1',
    title: 'Software Architecture',
    description: 'A mindmap exploring different software architecture patterns',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23f0f0f0" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif"%3EArchitecture%3C/text%3E%3C/svg%3E',
    metadata: {
      direction: 'horizontal',
      forceLayout: false,
    },
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
          edgeColor: '#00FF00',
        },
        dragHandle: DRAGHANDLE.SELECTOR,
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
        dragHandle: DRAGHANDLE.SELECTOR,
        width: 400,
        height: 80,
      },
      //   {
      //     id: 'left-4',
      //     type: MINDMAP_TYPES.SHAPE_NODE,
      //     position: { x: 200, y: 400 },
      //     data: {
      //       level: 2,
      //       content: '<p>Left Shape Node</p>',
      //       parentId: 'left-1',
      //       shape: 'rectangle',
      //       metadata: {
      //         fill: 'lightblue',
      //         stroke: 'blue',
      //         strokeWidth: 2,
      //       },
      //       side: SIDE.LEFT,
      //       isCollapsed: false,
      //     },
      //     width: 300,
      //     height: 150,
      //   },
      //   {
      //     id: 'left-2',
      //     type: MINDMAP_TYPES.TEXT_NODE,
      //     position: { x: 200, y: 200 },
      //     data: {
      //       level: 2,
      //       content: '<p>Left Child</p>',
      //       parentId: 'left-1',
      //       side: SIDE.LEFT,
      //       isCollapsed: false,
      //     },
      //     dragHandle: DRAGHANDLE.SELECTOR,
      //     width: 150,
      //     height: 60,
      //   },
      //   {
      //     id: 'right-1',
      //     type: MINDMAP_TYPES.TEXT_NODE,
      //     position: { x: 550, y: 300 },
      //     data: {
      //       level: 1,
      //       content: '<p>Right Branch</p>',
      //       parentId: 'root',
      //       side: SIDE.RIGHT,
      //       isCollapsed: false,
      //     },
      //     dragHandle: DRAGHANDLE.SELECTOR,
      //     width: 200,
      //     height: 80,
      //   },
      //   {
      //     id: 'right-2',
      //     type: MINDMAP_TYPES.TEXT_NODE,
      //     position: { x: 600, y: 200 },
      //     data: {
      //       level: 2,
      //       content: '<p>Right Child</p>',
      //       parentId: 'right-1',
      //       side: SIDE.RIGHT,
      //       isCollapsed: false,
      //     },
      //     dragHandle: DRAGHANDLE.SELECTOR,
      //     width: 500,
      //     height: 60,
      //   },
      //   {
      //     id: 'right-3',
      //     type: MINDMAP_TYPES.SHAPE_NODE,
      //     position: { x: 600, y: 400 },
      //     data: {
      //       level: 2,
      //       content: '<p>Right Shape Node</p>',
      //       parentId: 'right-1',
      //       shape: 'circle',
      //       side: SIDE.RIGHT,
      //       isCollapsed: false,
      //     },
      //     width: 180,
      //     height: 150,
      //   },
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
          strokeColor: '#00FF00',
          strokeWidth: 2,
        },
      },
      //   {
      //     id: 'e-left-1-left-4',
      //     source: 'left-1',
      //     target: 'left-4',
      //     type: MINDMAP_TYPES.EDGE,
      //     sourceHandle: 'first-source-left-1',
      //     targetHandle: 'second-target-left-4',
      //     data: {
      //       strokeColor: 'var(--primary)',
      //       strokeWidth: 2,
      //     },
      //   },
      //   {
      //     id: 'e-left-1-left-2',
      //     source: 'left-1',
      //     target: 'left-2',
      //     type: MINDMAP_TYPES.EDGE,
      //     sourceHandle: 'first-source-left-1',
      //     targetHandle: 'second-target-left-2',
      //     data: {
      //       strokeColor: 'var(--primary)',
      //       strokeWidth: 2,
      //     },
      //   },
      //   {
      //     id: 'e-root-right-1',
      //     source: 'root',
      //     target: 'right-1',
      //     type: MINDMAP_TYPES.EDGE,
      //     sourceHandle: 'second-source-root',
      //     targetHandle: 'first-target-right-1',
      //     data: {
      //       strokeColor: 'var(--primary)',
      //       strokeWidth: 2,
      //     },
      //   },
      //   {
      //     id: 'e-right-1-right-2',
      //     source: 'right-1',
      //     target: 'right-2',
      //     type: MINDMAP_TYPES.EDGE,
      //     sourceHandle: 'second-source-right-1',
      //     targetHandle: 'first-target-right-2',
      //     data: {
      //       strokeColor: 'var(--primary)',
      //       strokeWidth: 2,
      //     },
      //   },
      //   {
      //     id: 'e-right-1-right-3',
      //     source: 'right-1',
      //     target: 'right-3',
      //     type: MINDMAP_TYPES.EDGE,
      //     sourceHandle: 'second-source-right-1',
      //     targetHandle: 'first-target-right-3',
      //     data: {
      //       strokeColor: 'var(--primary)',
      //       strokeWidth: 2,
      //     },
      //   },
    ],
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    updatedAt: new Date('2024-03-20T14:22:00Z').toISOString(),
    status: 'active',
  },
  {
    id: '2',
    title: 'Project Planning',
    description: 'Planning phases and milestones for the new project',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23e3f2fd" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%231976d2" font-family="sans-serif"%3EPlanning%3C/text%3E%3C/svg%3E',
    metadata: {
      direction: 'vertical',
      forceLayout: false,
    },
    nodes: [
      {
        id: 'root-2',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: '<p>Project Plan</p>',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
          edgeColor: 'var(--primary)',
        },
        dragHandle: DRAGHANDLE.SELECTOR,
        width: 250,
        height: 100,
      },
    ],
    edges: [],
    createdAt: new Date('2024-02-10T09:15:00Z').toISOString(),
    updatedAt: new Date('2024-03-18T11:45:00Z').toISOString(),
    status: 'active',
  },
  {
    id: '3',
    title: 'Learning Roadmap',
    description: 'Personal learning path for web development',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23f3e5f5" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%237b1fa2" font-family="sans-serif"%3ELearning%3C/text%3E%3C/svg%3E',
    metadata: {
      direction: 'horizontal',
      forceLayout: true,
    },
    nodes: [
      {
        id: 'root-3',
        type: MINDMAP_TYPES.ROOT_NODE,
        position: { x: 0, y: 0 },
        data: {
          level: 0,
          content: '<p>Learning Path</p>',
          side: SIDE.MID,
          isCollapsed: false,
          pathType: PATH_TYPES.SMOOTHSTEP,
          edgeColor: 'var(--primary)',
        },
        dragHandle: DRAGHANDLE.SELECTOR,
        width: 250,
        height: 100,
      },
    ],
    edges: [],
    createdAt: new Date('2024-01-05T08:00:00Z').toISOString(),
    updatedAt: new Date('2024-03-15T16:30:00Z').toISOString(),
    status: 'draft',
  },
];

let mindmapStorage = [...mockMindmaps];

export default class MindmapMockService implements MindmapApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getMindmaps(request: MindmapCollectionRequest): Promise<ApiResponse<MindmapData[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 0, pageSize = 20, sort = 'desc', filter = '' } = request;

        // Filter mindmaps
        let filtered = [...mindmapStorage];
        if (filter) {
          const searchTerm = filter.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.title.toLowerCase().includes(searchTerm) ||
              (m.description || '').toLowerCase().includes(searchTerm)
          );
        }

        // Sort mindmaps
        filtered.sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return sort === 'desc' ? dateB - dateA : dateA - dateB;
        });

        // Paginate
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedData = filtered.slice(start, end);

        const pagination: Pagination = {
          currentPage: page + 1,
          pageSize,
          totalItems,
          totalPages,
        };

        resolve({
          success: true,
          code: 200,
          data: paginatedData,
          pagination: mapPagination(pagination),
        });
      }, 500);
    });
  }

  async getMindmapById(id: string): Promise<MindmapData> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mindmap = mindmapStorage.find((m) => m.id === id);
        if (mindmap) {
          resolve({ ...mindmap });
        } else {
          reject(new Error(`Mindmap with id ${id} not found`));
        }
      }, 300);
    });
  }

  async createMindmap(data: MindmapData): Promise<MindmapData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMindmap: MindmapData = {
          ...data,
          id: data.id || crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mindmapStorage.push(newMindmap);
        resolve({ ...newMindmap });
      }, 300);
    });
  }

  async updateMindmap(id: string, data: Partial<MindmapData>): Promise<MindmapData> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mindmapStorage.findIndex((m) => m.id === id);
        if (index !== -1) {
          mindmapStorage[index] = {
            ...mindmapStorage[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve({ ...mindmapStorage[index] });
        } else {
          reject(new Error(`Mindmap with id ${id} not found`));
        }
      }, 300);
    });
  }

  async deleteMindmap(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mindmapStorage.findIndex((m) => m.id === id);
        if (index !== -1) {
          mindmapStorage.splice(index, 1);
          resolve();
        } else {
          reject(new Error(`Mindmap with id ${id} not found`));
        }
      }, 300);
    });
  }

  async updateMindmapTitle(id: string, name: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mindmapStorage.findIndex((m) => m.id === id);
        if (index !== -1) {
          mindmapStorage[index] = {
            ...mindmapStorage[index],
            title: name,
            updatedAt: new Date().toISOString(),
          };
          resolve(null);
        } else {
          reject(new Error(`Mindmap with id ${id} not found`));
        }
      }, 300);
    });
  }
}
