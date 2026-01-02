import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Question, Assignment } from '../types';

interface AssignmentEditorState {
  // Current assignment being edited
  currentAssignment: Partial<Assignment> | null;

  // Questions in current assignment
  questions: Question[];

  // UI state
  isQuestionBankDialogOpen: boolean;
  hasUnsavedChanges: boolean;

  // Actions - Metadata
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setDueDate: (dueDate: string | undefined) => void;
  setClassId: (classId: string) => void;

  // Actions - Questions
  addQuestions: (questions: Question[]) => void;
  removeQuestion: (questionId: string) => void;
  reorderQuestions: (questions: Question[]) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;

  // Actions - Dialog
  openQuestionBankDialog: () => void;
  closeQuestionBankDialog: () => void;

  // Actions - Assignment
  loadAssignment: (assignment: Assignment) => void;
  createNewAssignment: (classId: string) => void;
  resetEditor: () => void;
  markSaved: () => void;
}

const useAssignmentEditorStore = create<AssignmentEditorState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentAssignment: null,
        questions: [],
        isQuestionBankDialogOpen: false,
        hasUnsavedChanges: false,

        // Metadata actions
        setTitle: (title) =>
          set((state) => ({
            currentAssignment: { ...state.currentAssignment, title },
            hasUnsavedChanges: true,
          })),

        setDescription: (description) =>
          set((state) => ({
            currentAssignment: { ...state.currentAssignment, description },
            hasUnsavedChanges: true,
          })),

        setDueDate: (dueDate) =>
          set((state) => ({
            currentAssignment: { ...state.currentAssignment, dueDate },
            hasUnsavedChanges: true,
          })),

        setClassId: (classId) =>
          set((state) => ({
            currentAssignment: { ...state.currentAssignment, classId },
            hasUnsavedChanges: true,
          })),

        // Question actions
        addQuestions: (newQuestions) =>
          set((state) => ({
            questions: [...state.questions, ...newQuestions],
            hasUnsavedChanges: true,
          })),

        removeQuestion: (questionId) =>
          set((state) => ({
            questions: state.questions.filter((q) => q.id !== questionId),
            hasUnsavedChanges: true,
          })),

        reorderQuestions: (questions) =>
          set(() => ({
            questions,
            hasUnsavedChanges: true,
          })),

        updateQuestion: (questionId, updates) =>
          set((state) => ({
            questions: state.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ) as Question[],
            hasUnsavedChanges: true,
          })),

        // Dialog actions
        openQuestionBankDialog: () => set({ isQuestionBankDialogOpen: true }),

        closeQuestionBankDialog: () => set({ isQuestionBankDialogOpen: false }),

        // Assignment actions
        loadAssignment: (assignment) =>
          set({
            currentAssignment: assignment,
            questions: assignment.questions || [],
            hasUnsavedChanges: false,
          }),

        createNewAssignment: (classId) =>
          set({
            currentAssignment: {
              classId,
              title: '',
              description: '',
              status: 'draft',
            },
            questions: [],
            hasUnsavedChanges: false,
          }),

        resetEditor: () =>
          set({
            currentAssignment: null,
            questions: [],
            isQuestionBankDialogOpen: false,
            hasUnsavedChanges: false,
          }),

        markSaved: () => set({ hasUnsavedChanges: false }),
      }),
      {
        name: 'assignment-editor-storage',
        // Only persist current assignment and questions (not UI state)
        partialize: (state) => ({
          currentAssignment: state.currentAssignment,
          questions: state.questions,
        }),
      }
    ),
    { name: 'AssignmentEditorStore' }
  )
);

export default useAssignmentEditorStore;
