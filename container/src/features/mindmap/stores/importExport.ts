import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MindMapNode, MindMapEdge } from '../types';
import { generateId } from '@/shared/lib/utils';
import { useCoreStore } from './core';

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

interface ImportExportState {
  isExporting: boolean;
  isImporting: boolean;

  exportToJSON: (options?: ExportOptions) => string;

  importFromJSON: (jsonData: string) => boolean;

  validateMindmapData: (data: any) => boolean;
}

interface ExportOptions {
  includeMetadata?: boolean;
  includeLayout?: boolean;
  title?: string;
  description?: string;
  indentSize?: number;
}

export const useImportExportStore = create<ImportExportState>()(
  devtools(
    (_, get) => ({
      isExporting: false,
      isImporting: false,

      exportToJSON: (options: ExportOptions = {}) => {
        const { nodes, edges } = useCoreStore.getState();

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
        try {
          const data = JSON.parse(jsonData);

          if (!get().validateMindmapData(data)) {
            return false;
          }

          const { setNodes, setEdges } = useCoreStore.getState();

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

          return true;
        } catch (error) {
          console.error('JSON import failed:', error);
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
    }),
    {
      name: 'mindmap-import-export-store',
    }
  )
);
