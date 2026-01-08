import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Question, QuestionType, Difficulty, SubjectCode, BankType } from '../types';

interface QuestionBankFilters {
  searchText: string;
  questionType?: QuestionType | QuestionType[];
  difficulty?: Difficulty | Difficulty[];
  subjectCode?: SubjectCode | SubjectCode[];
  grade?: string | string[];
  chapter?: string | string[];
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
    searchText: '',
    questionType: undefined,
    difficulty: undefined,
    subjectCode: undefined,
    grade: undefined,
    chapter: undefined,
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
              grade: undefined,
              chapter: undefined,
              bankType: 'personal' as BankType | undefined, // Reset to personal bank
            },
          }),

        hasActiveFilters: () => {
          const { filters } = get();
          const hasQuestionType = Array.isArray(filters.questionType)
            ? filters.questionType.length > 0
            : filters.questionType !== undefined;
          const hasDifficulty = Array.isArray(filters.difficulty)
            ? filters.difficulty.length > 0
            : filters.difficulty !== undefined;
          const hasSubjectCode = Array.isArray(filters.subjectCode)
            ? filters.subjectCode.length > 0
            : filters.subjectCode !== undefined;
          const hasGrade = Array.isArray(filters.grade)
            ? filters.grade.length > 0
            : filters.grade !== undefined;
          const hasChapter = Array.isArray(filters.chapter)
            ? filters.chapter.length > 0
            : filters.chapter !== undefined;

          return (
            filters.searchText !== '' ||
            hasQuestionType ||
            hasDifficulty ||
            hasSubjectCode ||
            hasGrade ||
            hasChapter ||
            (filters.bankType !== undefined && filters.bankType !== 'personal')
          );
        },

        shouldShowChapterFilter: () => {
          const { filters } = get();
          const subjects = Array.isArray(filters.subjectCode) ? filters.subjectCode : [];
          const grades = Array.isArray(filters.grade) ? filters.grade : [];
          return subjects.length === 1 && grades.length === 1;
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
