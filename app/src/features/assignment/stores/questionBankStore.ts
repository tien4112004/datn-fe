import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Question, QuestionType, Difficulty, SubjectCode, BankType } from '../types';

interface QuestionBankFilters {
  searchText: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  subjectCode?: SubjectCode;
  bankType?: BankType; // Filter by personal or application bank
}

interface QuestionBankStore {
  // Selection state (not persisted)
  selectedQuestions: Question[];

  // Filter state (persisted)
  filters: QuestionBankFilters;

  // UI state (not persisted)
  isDialogOpen: boolean;

  // Actions - Selection
  toggleQuestionSelection: (question: Question) => void;
  clearSelection: () => void;
  isQuestionSelected: (questionId: string) => boolean;

  // Actions - Filters
  setFilters: (filters: Partial<QuestionBankFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;

  // Actions - Dialog
  openDialog: () => void;
  closeDialog: () => void;

  // Actions - Utility
  reset: () => void;
}

const initialState = {
  selectedQuestions: [],
  filters: {
    searchText: '',
    questionType: undefined,
    difficulty: undefined,
    subjectCode: undefined,
    bankType: 'personal' as BankType | undefined, // Default to personal bank
  },
  isDialogOpen: false,
};

const useQuestionBankStore = create<QuestionBankStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Selection actions
        toggleQuestionSelection: (question) =>
          set((state) => {
            const exists = state.selectedQuestions.some((q) => q.id === question.id);
            if (exists) {
              return {
                selectedQuestions: state.selectedQuestions.filter((q) => q.id !== question.id),
              };
            }
            return {
              selectedQuestions: [...state.selectedQuestions, question],
            };
          }),

        clearSelection: () => set({ selectedQuestions: [] }),

        isQuestionSelected: (questionId) => {
          return get().selectedQuestions.some((q) => q.id === questionId);
        },

        // Filter actions
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),

        clearFilters: () =>
          set({
            filters: {
              searchText: '',
              questionType: undefined,
              difficulty: undefined,
              subjectCode: undefined,
              bankType: 'personal' as BankType | undefined, // Reset to personal bank
            },
          }),

        hasActiveFilters: () => {
          const { filters } = get();
          return (
            filters.searchText !== '' ||
            filters.questionType !== undefined ||
            filters.difficulty !== undefined ||
            filters.subjectCode !== undefined ||
            (filters.bankType !== undefined && filters.bankType !== 'personal')
          );
        },

        // Dialog actions
        openDialog: () => set({ isDialogOpen: true }),

        closeDialog: () =>
          set({
            isDialogOpen: false,
            selectedQuestions: [], // Clear selection when closing
          }),

        // Utility actions
        reset: () => set(initialState),
      }),
      {
        name: 'question-bank-store',
        partialize: (state) => ({
          // Only persist filters (not selection or dialog state)
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'question-bank-store',
    }
  )
);

export default useQuestionBankStore;
