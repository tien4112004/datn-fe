import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { ExamMatrix, MatrixCell, Topic, ExamMatrixFilters, TopicId } from '@/features/exam-matrix/types';
import type { Difficulty } from '@/features/assignment/types';

interface ExamMatrixStore {
  // Current working matrix (when building/editing)
  currentMatrix: ExamMatrix | null;

  // Question selections mapped to matrix cells (questionId -> cellId)
  questionSelections: Record<string, string>;

  // Filters for matrix list (persisted)
  filters: ExamMatrixFilters;

  // UI state (not persisted)
  isBuilderOpen: boolean;
  activeCellId: string | null; // Currently focused cell in generator

  // Actions - Matrix
  setCurrentMatrix: (matrix: ExamMatrix | null) => void;
  updateMatrix: (updates: Partial<ExamMatrix>) => void;
  addTopic: (topic: Topic) => void;
  removeTopic: (topicId: TopicId) => void;
  updateTopic: (topicId: TopicId, updates: Partial<Topic>) => void;

  // Actions - Cells
  updateCell: (cell: MatrixCell) => void;
  removeCell: (cellId: string) => void;
  getCellsByTopic: (topicId: TopicId) => MatrixCell[];
  getCellByTopicAndDifficulty: (topicId: TopicId, difficulty: Difficulty) => MatrixCell | undefined;

  // Actions - Question Selection
  assignQuestionToCell: (questionId: string, cellId: string) => void;
  unassignQuestion: (questionId: string) => void;
  getQuestionsForCell: (cellId: string) => string[];
  clearAllSelections: () => void;

  // Actions - UI
  openBuilder: (matrix?: ExamMatrix) => void;
  closeBuilder: () => void;
  setActiveCell: (cellId: string | null) => void;

  // Actions - Filters
  setFilters: (filters: Partial<ExamMatrixFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;

  // Utility
  reset: () => void;
}

const initialState = {
  currentMatrix: null,
  questionSelections: {},
  filters: {
    searchText: '',
    subjectCode: undefined,
    createdBy: undefined,
    page: 1,
    limit: 10,
  },
  isBuilderOpen: false,
  activeCellId: null,
};

const useExamMatrixStore = create<ExamMatrixStore>()(
  devtools(
    persist(
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
                  topics: state.currentMatrix.topics.map((t) =>
                    t.id === topicId ? { ...t, ...updates } : t
                  ),
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

            // Remove cell and unassign any questions assigned to it
            const newSelections = { ...state.questionSelections };
            Object.keys(newSelections).forEach((qId) => {
              if (newSelections[qId] === cellId) {
                delete newSelections[qId];
              }
            });

            return {
              currentMatrix: {
                ...state.currentMatrix,
                cells: state.currentMatrix.cells.filter((c) => c.id !== cellId),
              },
              questionSelections: newSelections,
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

        // Question selection actions
        assignQuestionToCell: (questionId, cellId) =>
          set((state) => ({
            questionSelections: {
              ...state.questionSelections,
              [questionId]: cellId,
            },
          })),

        unassignQuestion: (questionId) =>
          set((state) => {
            const newSelections = { ...state.questionSelections };
            delete newSelections[questionId];
            return { questionSelections: newSelections };
          }),

        getQuestionsForCell: (cellId) => {
          const { questionSelections } = get();
          return Object.entries(questionSelections)
            .filter(([_, cId]) => cId === cellId)
            .map(([qId, _]) => qId);
        },

        clearAllSelections: () => set({ questionSelections: {} }),

        // UI actions
        openBuilder: (matrix) =>
          set({
            currentMatrix: matrix || null,
            isBuilderOpen: true,
            questionSelections: {}, // Clear selections when opening builder
          }),

        closeBuilder: () =>
          set({
            isBuilderOpen: false,
            currentMatrix: null,
            questionSelections: {},
          }),

        setActiveCell: (cellId) => set({ activeCellId: cellId }),

        // Filter actions
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),

        clearFilters: () =>
          set({
            filters: {
              searchText: '',
              subjectCode: undefined,
              createdBy: undefined,
              page: 1,
              limit: 10,
            },
          }),

        hasActiveFilters: () => {
          const { filters } = get();
          return (
            filters.searchText !== '' || filters.subjectCode !== undefined || filters.createdBy !== undefined
          );
        },

        // Utility actions
        reset: () => set(initialState),
      }),
      {
        name: 'exam-matrix-store',
        partialize: (state) => ({
          // Only persist filters
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'exam-matrix-store',
    }
  )
);

export default useExamMatrixStore;
