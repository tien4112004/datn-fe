import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AssessmentMatrix, MatrixCell, Topic, TopicId } from '@/features/assessment-matrix/types';
import type { Difficulty } from '@/features/assignment/types';

interface AssessmentMatrixStore {
  // Current working matrix (when building/editing)
  currentMatrix: AssessmentMatrix | null;

  // Actions - Matrix
  setCurrentMatrix: (matrix: AssessmentMatrix | null) => void;
  updateMatrix: (updates: Partial<AssessmentMatrix>) => void;
  addTopic: (topic: Topic) => void;
  removeTopic: (topicId: TopicId) => void;
  updateTopic: (topicId: TopicId, updates: Partial<Topic>) => void;

  // Actions - Cells
  updateCell: (cell: MatrixCell) => void;
  removeCell: (cellId: string) => void;
  getCellsByTopic: (topicId: TopicId) => MatrixCell[];
  getCellByTopicAndDifficulty: (topicId: TopicId, difficulty: Difficulty) => MatrixCell | undefined;

  // Utility
  reset: () => void;
}

const initialState = {
  currentMatrix: null,
};

const useAssessmentMatrixStore = create<AssessmentMatrixStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Matrix actions
      setCurrentMatrix: (matrix) => set({ currentMatrix: matrix }),

      updateMatrix: (updates) =>
        set((state) => ({
          currentMatrix: state.currentMatrix ? { ...state.currentMatrix, ...updates } : null,
        })),

      addTopic: (topic) =>
        set((state) => ({
          currentMatrix: state.currentMatrix
            ? {
                ...state.currentMatrix,
                topics: [...state.currentMatrix.topics, topic],
              }
            : null,
        })),

      removeTopic: (topicId) =>
        set((state) => {
          if (!state.currentMatrix) return state;

          return {
            currentMatrix: {
              ...state.currentMatrix,
              topics: state.currentMatrix.topics.filter((t) => t.id !== topicId),
              cells: state.currentMatrix.cells.filter((c) => c.topicId !== topicId),
            },
          };
        }),

      updateTopic: (topicId, updates) =>
        set((state) => ({
          currentMatrix: state.currentMatrix
            ? {
                ...state.currentMatrix,
                topics: state.currentMatrix.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
              }
            : null,
        })),

      // Cell actions
      updateCell: (cell) =>
        set((state) => {
          if (!state.currentMatrix) return state;

          const existingIndex = state.currentMatrix.cells.findIndex((c) => c.id === cell.id);

          if (existingIndex >= 0) {
            // Update existing cell
            const newCells = [...state.currentMatrix.cells];
            newCells[existingIndex] = cell;
            return {
              currentMatrix: {
                ...state.currentMatrix,
                cells: newCells,
              },
            };
          } else {
            // Add new cell
            return {
              currentMatrix: {
                ...state.currentMatrix,
                cells: [...state.currentMatrix.cells, cell],
              },
            };
          }
        }),

      removeCell: (cellId) =>
        set((state) => {
          if (!state.currentMatrix) return state;

          return {
            currentMatrix: {
              ...state.currentMatrix,
              cells: state.currentMatrix.cells.filter((c) => c.id !== cellId),
            },
          };
        }),

      getCellsByTopic: (topicId) => {
        const { currentMatrix } = get();
        if (!currentMatrix) return [];
        return currentMatrix.cells.filter((c) => c.topicId === topicId);
      },

      getCellByTopicAndDifficulty: (topicId, difficulty) => {
        const { currentMatrix } = get();
        if (!currentMatrix) return undefined;
        return currentMatrix.cells.find((c) => c.topicId === topicId && c.difficulty === difficulty);
      },

      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: 'assessment-matrix-store',
    }
  )
);

export default useAssessmentMatrixStore;
