import { useShortcuts } from './useShortcut';
import { useNodeOperationsStore, useCoreStore } from '../stores';
import { SIDE } from '../types';

/**
 * Keyboard shortcuts for tree view operations.
 * Only active when a tree node is focused/selected.
 *
 * Shortcuts:
 * - Tab or Enter: Add child node
 * - Ctrl+Enter: Add sibling node
 * - Delete or Backspace: Delete node
 */
export const useTreeKeyboardShortcuts = () => {
  const addChildNode = useNodeOperationsStore((state) => state.addChildNode);
  const addNode = useNodeOperationsStore((state) => state.addNode);
  const markNodeForDeletion = useNodeOperationsStore((state) => state.markNodeForDeletion);
  const nodes = useCoreStore((state) => state.nodes);
  const edges = useCoreStore((state) => state.edges);

  useShortcuts([
    // Tab: Add child node
    {
      shortcutKey: 'Tab',
      onKeyPressed: () => {
        const selectedNode = nodes.find((n) => n.selected);
        if (!selectedNode) return;

        const side = selectedNode.data.side === SIDE.LEFT ? SIDE.LEFT : SIDE.RIGHT;
        addChildNode(selectedNode, { x: 0, y: 0 }, side);
      },
      shouldExecute: () => {
        // Only execute if a tree node is selected
        // And not in edit mode (contentEditable focused)
        const activeElement = document.activeElement;
        const isEditing = activeElement?.getAttribute('contenteditable') === 'true';
        return !isEditing && nodes.some((n) => n.selected);
      },
    },
    // Enter: Add child node
    {
      shortcutKey: 'Enter',
      onKeyPressed: () => {
        const selectedNode = nodes.find((n) => n.selected);
        if (!selectedNode) return;

        const side = selectedNode.data.side === SIDE.LEFT ? SIDE.LEFT : SIDE.RIGHT;
        addChildNode(selectedNode, { x: 0, y: 0 }, side);
      },
      shouldExecute: () => {
        const activeElement = document.activeElement;
        const isEditing = activeElement?.getAttribute('contenteditable') === 'true';
        return !isEditing && nodes.some((n) => n.selected);
      },
    },

    // Ctrl+Enter: Add sibling node
    {
      shortcutKey: 'Ctrl+Enter',
      onKeyPressed: () => {
        const selectedNode = nodes.find((n) => n.selected);
        if (!selectedNode) return;

        // Find parent
        const parentEdge = edges.find((edge) => edge.target === selectedNode.id);
        if (!parentEdge) {
          // Root node - add another root
          addNode({
            content: 'New Root',
            position: { x: selectedNode.position.x + 300, y: selectedNode.position.y },
          });
          return;
        }

        const parentNode = nodes.find((n) => n.id === parentEdge.source);
        if (!parentNode) return;

        const side = selectedNode.data.side;
        addChildNode(parentNode, { x: 0, y: 0 }, side || SIDE.RIGHT);
      },
      shouldExecute: () => {
        const activeElement = document.activeElement;
        const isEditing = activeElement?.getAttribute('contenteditable') === 'true';
        return !isEditing && nodes.some((n) => n.selected);
      },
    },

    // Delete: Delete node
    {
      shortcutKey: 'Delete',
      onKeyPressed: () => {
        markNodeForDeletion();
      },
      shouldExecute: () => {
        const activeElement = document.activeElement;
        const isEditing = activeElement?.getAttribute('contenteditable') === 'true';
        return !isEditing && nodes.some((n) => n.selected);
      },
    },
    // Backspace: Delete node
    {
      shortcutKey: 'Backspace',
      onKeyPressed: () => {
        markNodeForDeletion();
      },
      shouldExecute: () => {
        const activeElement = document.activeElement;
        const isEditing = activeElement?.getAttribute('contenteditable') === 'true';
        return !isEditing && nodes.some((n) => n.selected);
      },
    },
  ]);
};
