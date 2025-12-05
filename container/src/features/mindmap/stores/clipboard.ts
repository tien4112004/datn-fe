import { create } from 'zustand';
import type { MindMapNode, MindMapEdge } from '../types';
import { MINDMAP_TYPES, PATH_TYPES, SIDE } from '../types';
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
  getAllDescendantNodes,
  getRootNodeOfSubtree,
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

      if (selectedNodes.length === 0) return;

      // Collect all nodes to copy: selected nodes + all their descendants
      const allNodesToCopy = new Set<string>();
      selectedNodes.forEach((node) => {
        allNodesToCopy.add(node.id);
        const descendants = getAllDescendantNodes(node.id, nodes);
        descendants.forEach((d) => allNodesToCopy.add(d.id));
      });

      const nodesToCopy = nodes.filter((n) => allNodesToCopy.has(n.id));

      // Calculate edges that connect only nodes within the copied set
      // This avoids copying edges that link to nodes outside the selection
      const edgesToCopy = edges.filter(
        (edge) => allNodesToCopy.has(edge.source) && allNodesToCopy.has(edge.target)
      );

      // Find root nodes in the selection (nodes whose parents are not in the selection)
      const copyRootNodes = nodesToCopy.filter(
        (node) => !node.data.parentId || !allNodesToCopy.has(node.data.parentId)
      );

      // Get tree context from the original root for each copy root
      const treeContextMap: Record<string, any> = {};
      copyRootNodes.forEach((copyRoot) => {
        const originalRoot = getRootNodeOfSubtree(copyRoot.id, nodes);
        if (originalRoot) {
          treeContextMap[copyRoot.id] = {
            pathType: originalRoot.data?.pathType ?? PATH_TYPES.SMOOTHSTEP,
            layoutType: originalRoot.data?.layoutType ?? DEFAULT_LAYOUT_TYPE,
            edgeColor: originalRoot.data?.edgeColor ?? '#0044FF',
            forceLayout: originalRoot.data?.forceLayout ?? false,
          };
        }
      });

      navigator.clipboard.writeText(
        JSON.stringify({
          nodes: nodesToCopy,
          edges: edgesToCopy,
          treeContext: treeContextMap,
          copyRootIds: copyRootNodes.map((n) => n.id),
        })
      );
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
        // Find the root node of the pasted tree (first node is always the root)
        const pastedRootNode = aiNodes.find((n) => n.type === MINDMAP_TYPES.ROOT_NODE);
        if (pastedRootNode) {
          setTimeout(() => {
            applyAutoLayout(pastedRootNode.id);
          }, 200);
        }

        pushToUndoStack();
        set((state) => ({ offset: state.offset + 20 }), false, 'mindmap-clip/pasteFromClipboard');
        return;
      }

      // Check if it's standard mindmap JSON format
      if (parsedData.nodes && parsedData.edges) {
        const { nodes: clipboardNodes, edges: clipboardEdges, treeContext, copyRootIds } = parsedData;
        const { setNodes, setEdges } = useCoreStore.getState();
        const { applyAutoLayout } = useLayoutStore.getState();

        const { mousePosition, offset } = get();
        const rootPosition = clipboardNodes[0]?.position || { x: 0, y: 0 };

        // Create a map to track old IDs to new IDs
        const freshNodesMap = new Map<string, string>();
        clipboardNodes.forEach((node: any) => {
          const newId = generateId();
          freshNodesMap.set(node.id, newId);
        });

        // Determine which nodes are "copy roots" - nodes that should become root nodes
        const copyRootIdSet = new Set<string>(copyRootIds || []);

        // Generate fresh nodes with new IDs to avoid duplicates
        const freshNodes = clipboardNodes.map((node: any) => {
          const newId = freshNodesMap.get(node.id) || generateId();
          const isCopyRoot = copyRootIdSet.has(node.id);
          const context = treeContext?.[node.id];

          // If this node is a copy root and was not originally a root node, convert it
          const shouldConvertToRoot = isCopyRoot && node.type !== MINDMAP_TYPES.ROOT_NODE;

          if (shouldConvertToRoot) {
            return {
              ...node,
              id: newId,
              type: MINDMAP_TYPES.ROOT_NODE,
              dragHandle: undefined, // Root nodes don't have drag handles
              data: {
                ...node.data,
                parentId: undefined, // Root nodes have no parent
                level: 0,
                side: SIDE.MID,
                // Apply tree context from the original tree
                pathType: context?.pathType ?? node.data.pathType ?? PATH_TYPES.SMOOTHSTEP,
                layoutType: context?.layoutType ?? DEFAULT_LAYOUT_TYPE,
                edgeColor: context?.edgeColor ?? '#0044FF',
                forceLayout: context?.forceLayout ?? false,
              },
              selected: false,
            };
          }

          // For non-copy-roots, update parentId to new IDs
          const newParentId = freshNodesMap.get(node.data.parentId as string);
          const originalLevel = node.data.level ?? 0;

          // Calculate level adjustment for descendants of converted roots
          let levelAdjustment = 0;
          if (node.data.parentId && copyRootIdSet.has(node.data.parentId)) {
            // Direct child of a copy root - recalculate level
            const copyRootOriginalLevel =
              clipboardNodes.find((n: any) => n.id === node.data.parentId)?.data?.level ?? 0;
            levelAdjustment = -copyRootOriginalLevel;
          }

          return {
            ...node,
            id: newId,
            data: {
              ...node.data,
              parentId: newParentId || undefined,
              level: originalLevel + levelAdjustment,
            },
            selected: false,
          };
        });

        // Generate fresh edges - only those that connect nodes within the pasted set
        const freshEdges = clipboardEdges
          .map((edge: any) => {
            const newSourceId = freshNodesMap.get(edge.source);
            const newTargetId = freshNodesMap.get(edge.target);

            // Skip edges that don't have both ends in the fresh nodes
            if (!newSourceId || !newTargetId) return null;

            return {
              ...edge,
              id: generateId(),
              source: newSourceId,
              target: newTargetId,
              sourceHandle: edge.sourceHandle?.replace(edge.source, newSourceId),
              targetHandle: edge.targetHandle?.replace(edge.target, newTargetId),
            };
          })
          .filter(Boolean) as MindMapEdge[];

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

        // Apply auto layout to newly pasted root nodes if force layout is enabled
        const pastedRootNodes = freshNodes.filter((n: any) => n.type === MINDMAP_TYPES.ROOT_NODE);
        pastedRootNodes.forEach((rootNode: any) => {
          if (rootNode.data?.forceLayout) {
            setTimeout(() => {
              applyAutoLayout(rootNode.id);
            }, 200);
          }
        });

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
