import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface TreePanelState {
  collapsedNodes: Set<string>;
  hoveredNodeId: string | null;
  toggleNodeCollapse: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: (nodeIds: string[]) => void;
  setHoveredNodeId: (nodeId: string | null) => void;
}

interface PersistedState {
  collapsedNodes: string[];
}

export const useTreePanelStore = create<TreePanelState>()(
  devtools(
    persist(
      (set) => ({
        collapsedNodes: new Set(),
        hoveredNodeId: null,

        toggleNodeCollapse: (nodeId) =>
          set((state) => {
            const newSet = new Set(state.collapsedNodes);
            if (newSet.has(nodeId)) {
              newSet.delete(nodeId);
            } else {
              newSet.add(nodeId);
            }
            return { collapsedNodes: newSet };
          }),

        expandAll: () => set({ collapsedNodes: new Set() }),
        collapseAll: (nodeIds) => set({ collapsedNodes: new Set(nodeIds) }),
        setHoveredNodeId: (nodeId) => set({ hoveredNodeId: nodeId }),
      }),
      {
        name: 'TreePanelStore',
        storage: createJSONStorage(() => localStorage, {
          reviver: (_key, value: unknown) => {
            // Revive Set from array during deserialization
            if (
              value &&
              typeof value === 'object' &&
              'state' in value &&
              typeof value.state === 'object' &&
              value.state &&
              'collapsedNodes' in value.state
            ) {
              const state = value.state as PersistedState;
              return {
                ...value,
                state: {
                  ...state,
                  collapsedNodes: new Set(state.collapsedNodes || []),
                },
              };
            }
            return value;
          },
          replacer: (_key, value: unknown) => {
            // Replace Set with array during serialization
            if (
              value &&
              typeof value === 'object' &&
              'state' in value &&
              typeof value.state === 'object' &&
              value.state &&
              'collapsedNodes' in value.state
            ) {
              const state = value.state as TreePanelState;
              return {
                ...value,
                state: {
                  ...state,
                  collapsedNodes: Array.from(state.collapsedNodes),
                },
              };
            }
            return value;
          },
        }),
      }
    ),
    { name: 'TreePanelStore' }
  )
);
