import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { QuestionWithTopic, MatrixCell, AssignmentTopic } from '../types';

interface AssignmentEditorState {
  // UI State
  selectedQuestionId: string | null;
  isQuestionBankOpen: boolean;

  // Actions
  setSelectedQuestion: (id: string | null) => void;
  setQuestionBankOpen: (open: boolean) => void;

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
    (set) => ({
      // Initial state
      selectedQuestionId: null,
      isQuestionBankOpen: false,

      // UI actions
      setSelectedQuestion: (id) => set({ selectedQuestionId: id }),
      setQuestionBankOpen: (open) => set({ isQuestionBankOpen: open }),

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
