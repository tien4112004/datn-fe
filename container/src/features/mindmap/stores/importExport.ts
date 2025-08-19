import { type StateCreator } from 'zustand';
import type { MindMapNode, MindMapEdge } from '../types';
import { generateId } from '@/shared/lib/utils';
import type { CoreState } from './core';

interface MindmapExportData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  metadata: {
    version: string;
    exportedAt: string;
    title?: string;
    description?: string;
  };
}

interface ExportOptions {
  includeMetadata?: boolean;
  includeLayout?: boolean;
  title?: string;
  description?: string;
  indentSize?: number;
}

export interface ImportExportState {
  isExporting: boolean;
  isImporting: boolean;
  exportToJSON: (options?: ExportOptions) => string;
  importFromJSON: (jsonData: string) => boolean;
  validateMindmapData: (data: any) => boolean;
}

export const importExportSlice: StateCreator<
  CoreState & ImportExportState,
  [['zustand/devtools', never]],
  [],
  ImportExportState
> = (set, get) => ({
  isExporting: false,
  isImporting: false,

  exportToJSON: (options: ExportOptions = {}) => {
    const { nodes, edges } = get();

    const exportData: MindmapExportData = {
      nodes:
        options.includeLayout !== false
          ? nodes
          : (nodes.map((node) => ({
              ...node,
              position: { x: 0, y: 0 },
              style: undefined,
            })) as MindMapNode[]),
      edges:
        options.includeLayout !== false
          ? edges
          : (edges.map((edge) => ({
              ...edge,
              style: undefined,
            })) as MindMapEdge[]),
      metadata: {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        title: options.title,
        description: options.description,
      },
    };

    return JSON.stringify(exportData, null, options.indentSize || 2);
  },

  importFromJSON: (jsonData: string): boolean => {
    set({ isImporting: true }, false, 'mindmap-import-export/importFromJSON:start');

    try {
      const data = JSON.parse(jsonData);
      const { validateMindmapData, setNodes, setEdges } = get();

      if (!validateMindmapData(data)) {
        set({ isImporting: false }, false, 'mindmap-import-export/importFromJSON:invalid');
        return false;
      }

      // Generate new IDs to avoid conflicts
      const idMap = new Map<string, string>();

      const newNodes: MindMapNode[] = data.nodes.map((node: any) => {
        const newId = generateId();
        idMap.set(node.id, newId);

        return {
          ...node,
          id: newId,
          selected: false,
          position: node.position || { x: Math.random() * 400, y: Math.random() * 400 },
        };
      });

      const newEdges: MindMapEdge[] = data.edges.map((edge: any) => ({
        ...edge,
        id: generateId(),
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
        sourceHandle: edge.sourceHandle
          ? edge.sourceHandle.replace(edge.source, idMap.get(edge.source) || edge.source)
          : undefined,
        targetHandle: edge.targetHandle
          ? edge.targetHandle.replace(edge.target, idMap.get(edge.target) || edge.target)
          : undefined,
      }));

      setNodes(newNodes);
      setEdges(newEdges);

      set({ isImporting: false }, false, 'mindmap-import-export/importFromJSON:success');
      return true;
    } catch (error) {
      console.error('JSON import failed:', error);
      set({ isImporting: false }, false, 'mindmap-import-export/importFromJSON:error');
      return false;
    }
  },

  validateMindmapData: (data: any): boolean => {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check if it's our export format
    if (data.nodes && data.edges && data.metadata) {
      return Array.isArray(data.nodes) && Array.isArray(data.edges);
    }

    // Check if it's a simple nodes/edges format
    if (data.nodes || data.edges) {
      return true;
    }

    return false;
  },
});
