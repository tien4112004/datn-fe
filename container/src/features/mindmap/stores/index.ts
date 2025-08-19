import { create } from 'zustand';
import type { CoreState } from './core';
import type { NodeManipulationState } from './nodeManipulation';
import type { LayoutState } from './layout';
import coreSlice from './core';
import nodeManipulationSlice from './nodeManipulation';
import layoutSlice from './layout';
import { devtools, persist } from 'zustand/middleware';
import { nodeOperationSlice, type NodeOperationsState } from './nodeOperation';
import { clipboardSlice, type ClipboardState } from './clipboard';
import { undoRedoSlice, type UndoRedoState } from './undoredo';
import { importExportSlice, type ImportExportState } from './importExport';

export type CombinedState = CoreState &
  NodeManipulationState &
  NodeOperationsState &
  LayoutState &
  ClipboardState &
  UndoRedoState &
  ImportExportState;

export const useMindmapStore = create<CombinedState>()(
  persist(
    devtools((...a) => ({
      ...coreSlice(...a),
      ...nodeManipulationSlice(...a),
      ...nodeOperationSlice(...a),
      ...layoutSlice(...a),
      ...clipboardSlice(...a),
      ...undoRedoSlice(...a),
      ...importExportSlice(...a),
    })),
    {
      name: 'mindmap-store',
      partialize: (state) => {
        const { nodes, edges, layout } = state;
        return { nodes, edges, layout };
      },
    }
  )
);
