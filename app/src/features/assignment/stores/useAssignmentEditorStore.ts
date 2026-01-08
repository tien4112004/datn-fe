import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { QuestionWithTopic, MatrixCell, AssignmentTopic } from '../types';
import { VIEW_MODE, type ViewMode } from '@aiprimary/core';

interface AssignmentEditorState {
  // UI State
  selectedQuestionId: string | null;
  isQuestionBankOpen: boolean;
  currentQuestionIndex: number;
  questionViewModes: Map<string, ViewMode>;
  isMetadataDialogOpen: boolean;
  isMatrixEditorOpen: boolean;
  isMatrixViewOpen: boolean;

  // Actions
  setSelectedQuestion: (id: string | null) => void;
  setQuestionBankOpen: (open: boolean) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setQuestionViewMode: (questionId: string, mode: ViewMode) => void;
  toggleQuestionViewMode: (questionId: string) => void;
  setMetadataDialogOpen: (open: boolean) => void;
  setMatrixEditorOpen: (open: boolean) => void;
  setMatrixViewOpen: (open: boolean) => void;

  // Question operations (these will be used by components to update form)
  reorderQuestions: (
    questions: QuestionWithTopic[],
    oldIndex: number,
    newIndex: number
  ) => QuestionWithTopic[];

  // Matrix sync helper
  syncMatrixCounts: (
    questions: QuestionWithTopic[],
    topics: AssignmentTopic[],
    matrixCells: MatrixCell[]
  ) => MatrixCell[];
}

export const useAssignmentEditorStore = create<AssignmentEditorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedQuestionId: null,
      isQuestionBankOpen: false,
      currentQuestionIndex: 0,
      questionViewModes: new Map(),
      isMetadataDialogOpen: false,
      isMatrixEditorOpen: false,
      isMatrixViewOpen: false,

      // UI actions
      setSelectedQuestion: (id) => set({ selectedQuestionId: id }),
      setQuestionBankOpen: (open) => set({ isQuestionBankOpen: open }),
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      setQuestionViewMode: (questionId, mode) => {
        const modes = new Map(get().questionViewModes);
        modes.set(questionId, mode);
        set({ questionViewModes: modes });
      },
      toggleQuestionViewMode: (questionId) => {
        const modes = new Map(get().questionViewModes);
        const current = modes.get(questionId) || VIEW_MODE.EDITING;
        const next = current === VIEW_MODE.EDITING ? VIEW_MODE.VIEWING : VIEW_MODE.EDITING;
        modes.set(questionId, next);
        set({ questionViewModes: modes });
      },
      setMetadataDialogOpen: (open) => set({ isMetadataDialogOpen: open }),
      setMatrixEditorOpen: (open) => set({ isMatrixEditorOpen: open }),
      setMatrixViewOpen: (open) => set({ isMatrixViewOpen: open }),

      // Reorder questions (used with drag-drop)
      reorderQuestions: (questions, oldIndex, newIndex) => {
        const newQuestions = [...questions];
        const [movedQuestion] = newQuestions.splice(oldIndex, 1);
        newQuestions.splice(newIndex, 0, movedQuestion);
        return newQuestions;
      },

      // Sync matrix counts based on current questions
      syncMatrixCounts: (questions, _topics, matrixCells) => {
        // Count questions by topic × difficulty
        const counts = new Map<string, number>();

        questions.forEach((question) => {
          if (question.topicId) {
            const key = `${question.topicId}-${question.difficulty}`;
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });

        // Update matrix cells with current counts
        return matrixCells.map((cell) => ({
          ...cell,
          currentCount: counts.get(`${cell.topicId}-${cell.difficulty}`) || 0,
        }));
      },
    }),
    { name: 'AssignmentEditor' }
  )
);
