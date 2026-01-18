import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Question, QuestionType, Difficulty, SubjectCode, BankType } from '../types';

/**
 * UI Filter State
 * All filter fields use arrays for consistency
 */
interface QuestionBankFilters {
  search: string;
  type?: string[];
  difficulty?: string[];
  subject?: string[];
  grade?: string[];
  chapter?: string[];
  bankType: BankType; // Required by backend
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
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
  shouldShowChapterFilter: () => boolean;

  // Actions - Dialog
  openDialog: () => void;
  closeDialog: () => void;

  // Actions - Utility
  reset: () => void;
}

const initialState = {
  selectedQuestions: [],
  filters: {
    search: '',
    type: undefined,
    difficulty: undefined,
    subject: undefined,
    grade: undefined,
    chapter: undefined,
    bankType: 'personal' as BankType, // Default to personal bank (required by backend)
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDirection: 'DESC' as 'ASC' | 'DESC',
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
          set((state) => ({
            filters: {
              search: '',
              type: undefined,
              difficulty: undefined,
              subject: undefined,
              grade: undefined,
              chapter: undefined,
              bankType: state.filters.bankType, // Preserve current bank type
              page: 1, // Reset to first page
              pageSize: state.filters.pageSize, // Preserve page size
              sortBy: state.filters.sortBy, // Preserve sort settings
              sortDirection: state.filters.sortDirection,
            },
          })),

        hasActiveFilters: () => {
          const { filters } = get();
          return (
            filters.search !== '' ||
            (filters.type && filters.type.length > 0) ||
            (filters.difficulty && filters.difficulty.length > 0) ||
            (filters.subject && filters.subject.length > 0) ||
            (filters.grade && filters.grade.length > 0) ||
            (filters.chapter && filters.chapter.length > 0)
          );
        },

        shouldShowChapterFilter: () => {
          const { filters } = get();
          // Chapters require exactly one subject and one grade selected
          return filters.subject?.length === 1 && filters.grade?.length === 1;
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
