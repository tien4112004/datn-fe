import { create } from 'zustand';
import type { MindMapNode, MindMapEdge } from '../types';
import { generateId } from '@/shared/lib/utils';
import { devtools } from 'zustand/middleware';
import { useCoreStore } from './core';
import { useUndoRedoStore } from './undoredo';
import { useNodeOperationsStore } from './nodeOperation';
import { useLayoutStore } from './layout';
import {
  isAiGeneratedNodeStructure,
  convertAiDataToMindMapNodes,
  getTreeLayoutType,
  DEFAULT_LAYOUT_TYPE,
} from '../services/utils';

export interface ClipboardState {
  cloningNodes: MindMapNode[];
  cloningEdges: MindMapEdge[];

  mousePosition: { x: number; y: number };
  offset: number;
  dragTargetNodeId: string | null;
  mouseOverNodeId: string | null;
  setCloningNodes: (nodes: MindMapNode[]) => void;
  setCloningEdges: (edges: MindMapEdge[]) => void;
  setMousePosition: (position: { x: number; y: number }) => void;
  resetOffset: () => void;
  incrementOffset: () => void;
  copySelectedNodesAndEdges: () => void;
  pasteClonedNodesAndEdges: (
    screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number }
  ) => void;
  setDragTarget: (nodeId: string | null) => void;
  copyToClipboard: () => void;
  pasteFromClipboard: (
    screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number }
  ) => void;
  setMouseOverNodeId: (nodeId: string | null) => void;
  getMouseOverNodeId: () => string | null;
}

export const useClipboardStore = create<ClipboardState>()(
  devtools((set, get) => ({
    cloningNodes: [],
    cloningEdges: [],
    mousePosition: { x: 0, y: 0 },
    offset: 0,
    dragTargetNodeId: null,

    setCloningNodes: (nodes) => set({ cloningNodes: nodes }, false, 'mindmap-clip/setCloningNodes'),
    setCloningEdges: (edges) => set({ cloningEdges: edges }, false, 'mindmap-clip/setCloningEdges'),
    setMousePosition: (position) =>
      set({ mousePosition: position, offset: 0 }, false, 'mindmap-clip/setMousePosition'),
    resetOffset: () => set({ offset: 0 }, false, 'mindmap-clip/resetOffset'),
    incrementOffset: () =>
      set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/incrementOffset'),

    /**
     * @deprecated This method is deprecated and will be removed in future versions.
     * Use copyToClipboard instead.
     */
    copySelectedNodesAndEdges: () => {
      const nodes = useCoreStore.getState().nodes;
      const edges = useCoreStore.getState().edges;
      const selectedNodes = nodes.filter((node) => node.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);

      if (selectedNodes.length === 0) return;

      set(
        {
          cloningNodes: selectedNodes,
          cloningEdges: selectedEdges,
        },
        false,
        'mindmap-clip/copySelectedNodesAndEdges'
      );
    },

    /**
     * @deprecated This method is deprecated and will be removed in future versions.
     * Use pasteFromClipboard instead.
     */
    pasteClonedNodesAndEdges: (screenToFlowPosition) => {
      const { cloningNodes, cloningEdges, mousePosition, offset } = get();
      const { setNodes, setEdges } = useCoreStore.getState();
      const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
      prepareToPushUndo();

      if (cloningNodes.length === 0) return;

      const rootPosition = cloningNodes[0].position || { x: 0, y: 0 };

      // Generate fresh nodes with new IDs to avoid duplicates
      const freshNodes = cloningNodes.map((node) => ({
        ...node,
        id: generateId(),
        data: {
          ...node.data,
          metadata: {
            oldId: node.id,
          },
        },
        selected: false,
      }));

      const freshEdges = cloningEdges.map((edge) => {
        const newSource = freshNodes.find((node) => node.data.metadata?.oldId === edge.source);
        const newTarget = freshNodes.find((node) => node.data.metadata?.oldId === edge.target);

        return {
          ...edge,
          id: generateId(),
          source: newSource ? newSource.id : edge.source,
          target: newTarget ? newTarget.id : edge.target,
          sourceHandle: edge.sourceHandle?.replace(edge.source, newSource?.id || edge.source),
          targetHandle: edge.targetHandle?.replace(edge.target, newTarget?.id || edge.target),
        };
      });

      setNodes((nds: MindMapNode[]) => [
        ...nds.map((node) => ({ ...node, selected: false })),
        ...freshNodes.map((node) => {
          const { x, y } = screenToFlowPosition({
            x: mousePosition.x,
            y: mousePosition.y,
          });

          return {
            ...node,
            position: {
              x: x - rootPosition.x + node.position.x + offset,
              y: y - rootPosition.y + node.position.y + offset,
            },
            selected: true,
          };
        }),
      ]);
      setEdges((eds: MindMapEdge[]) => [...eds, ...freshEdges]);

      pushToUndoStack();

      // Increment offset for next paste
      set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/pasteClonedNodesAndEdges');
    },

    setDragTarget: (nodeId: string | null) => {
      set({ dragTargetNodeId: nodeId }, false, 'mindmap-clip/setDragTarget');
    },

    copyToClipboard: () => {
      const nodes = useCoreStore.getState().nodes;
      const edges = useCoreStore.getState().edges;
      const selectedNodes = nodes.filter((node) => node.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);
      navigator.clipboard.writeText(JSON.stringify({ nodes: selectedNodes, edges: selectedEdges }));
    },

    pasteFromClipboard: async (screenToFlowPosition: any) => {
      const clipboardData = await navigator.clipboard.readText();

      const { prepareToPushUndo, pushToUndoStack } = useUndoRedoStore.getState();
      prepareToPushUndo();

      // First, try to parse as JSON
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(clipboardData);
      } catch {
        // Not valid JSON - handle as plain text
        const addNode = useNodeOperationsStore.getState().addNode;
        addNode({
          content: clipboardData,
          position: screenToFlowPosition({
            x: get().mousePosition.x,
            y: get().mousePosition.y,
          }),
        });

        pushToUndoStack();
        return;
      }

      // Check if it's AI generated structure
      if (isAiGeneratedNodeStructure(parsedData)) {
        const { setNodes, setEdges, nodes } = useCoreStore.getState();
        const { applyAutoLayout } = useLayoutStore.getState();
        const { mousePosition, offset } = get();

        // Get layout info from existing root node, or use default for new trees
        const hasExistingNodes = nodes.length > 0;
        const layoutType = hasExistingNodes ? getTreeLayoutType(nodes) : DEFAULT_LAYOUT_TYPE;

        const basePosition = screenToFlowPosition({
          x: mousePosition.x,
          y: mousePosition.y,
        });

        const { nodes: aiNodes, edges: aiEdges } = convertAiDataToMindMapNodes(
          parsedData,
          {
            x: basePosition.x + offset,
            y: basePosition.y + offset,
          },
          layoutType
        );

        // Deselect existing nodes and add new AI nodes as selected
        setNodes((nds: MindMapNode[]) => [
          ...nds.map((node) => ({ ...node, selected: false })),
          ...aiNodes.map((node) => ({ ...node, selected: true })),
        ]);
        setEdges((eds: MindMapEdge[]) => [...eds, ...aiEdges]);

        // Trigger layout after nodes are added only if auto-layout is enabled
        setTimeout(() => {
          applyAutoLayout();
        }, 200);

        pushToUndoStack();
        set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/pasteFromClipboard');
        return;
      }

      // Check if it's standard mindmap JSON format
      if (parsedData.nodes && parsedData.edges) {
        const { nodes: clipboardNodes, edges: clipboardEdges } = parsedData;
        const { setNodes, setEdges } = useCoreStore.getState();

        const { mousePosition, offset } = get();
        const rootPosition = clipboardNodes[0].position || { x: 0, y: 0 };

        // Create a map to track old IDs to new IDs
        const freshNodesMap = new Map<string, string>();
        clipboardNodes.forEach((node: any) => {
          const newId = generateId();
          freshNodesMap.set(node.id, newId);
        });

        // Generate fresh nodes with new IDs to avoid duplicates
        const freshNodes = clipboardNodes.map((node: any) => ({
          ...node,
          id: freshNodesMap.get(node.id) || generateId(),
          data: {
            ...node.data,
            parentId: freshNodesMap.get(node.data.parentId as string) || undefined,
          },
          parentId: freshNodesMap.get(node.parentId as string) || undefined,
          selected: false,
        }));

        const freshEdges = clipboardEdges.map((edge: any) => {
          const newSourceId = freshNodesMap.get(edge.source);
          const newTargetId = freshNodesMap.get(edge.target);

          return {
            ...edge,
            id: generateId(),
            source: newSourceId ? newSourceId : edge.source,
            target: newTargetId ? newTargetId : edge.target,
            sourceHandle: edge.sourceHandle?.replace(edge.source, newSourceId || edge.source),
            targetHandle: edge.targetHandle?.replace(edge.target, newTargetId || edge.target),
          };
        });

        setNodes((nds: MindMapNode[]) => [
          ...nds.map((node) => ({ ...node, selected: false })),
          ...freshNodes.map((node: any) => {
            const { x, y } = screenToFlowPosition({
              x: mousePosition.x,
              y: mousePosition.y,
            });

            return {
              ...node,
              position: {
                x: x - rootPosition.x + node.position.x + offset,
                y: y - rootPosition.y + node.position.y + offset,
              },
              selected: true,
            };
          }),
        ]);
        setEdges((eds: MindMapEdge[]) => [...eds, ...freshEdges]);

        pushToUndoStack();
        set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/pasteFromClipboard');
        return;
      }

      // If we get here, it's valid JSON but not recognized format - treat as plain text
      const addNode = useNodeOperationsStore.getState().addNode;
      addNode({
        content: JSON.stringify(parsedData),
        position: screenToFlowPosition({
          x: get().mousePosition.x,
          y: get().mousePosition.y,
        }),
      });

      pushToUndoStack();
    },

    setMouseOverNodeId: (nodeId: string | null) => {
      set({ mouseOverNodeId: nodeId }, false, 'mindmap-clip/setMouseOverNodeId');
    },
  }))
);
