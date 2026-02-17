import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AssignmentQuestionWithTopic, MatrixCell, AssignmentTopic } from '../types';
import { VIEW_MODE, type ViewMode, createCellId } from '@aiprimary/core';

type MainView =
  | 'info'
  | 'questions'
  | 'matrix'
  | 'contexts'
  | 'questionsList'
  | 'generateQuestions'
  | 'generateMatrix'
  | 'fillMatrixGaps';

interface AssignmentEditorState {
  // UI State
  selectedQuestionId: string | null;
  isQuestionBankOpen: boolean;
  isQuestionListDialogOpen: boolean;
  currentQuestionId: string | null;
  currentContextId: string | null; // Selected context group (mutually exclusive with currentQuestionId)
  questionViewModes: Map<string, ViewMode>;
  isMetadataDialogOpen: boolean;
  isMatrixEditorOpen: boolean;
  isContextCreateFormOpen: boolean;
  isContextLibraryDialogOpen: boolean;
  isMatrixTemplateLibraryDialogOpen: boolean;
  isMatrixTemplateSaveDialogOpen: boolean;
  mainView: MainView;

  // Actions
  setSelectedQuestion: (id: string | null) => void;
  setQuestionBankOpen: (open: boolean) => void;
  setQuestionListDialogOpen: (open: boolean) => void;
  setCurrentQuestionId: (id: string | null) => void;
  setCurrentContextId: (id: string | null) => void;
  setQuestionViewMode: (questionId: string, mode: ViewMode) => void;
  toggleQuestionViewMode: (questionId: string) => void;
  setMetadataDialogOpen: (open: boolean) => void;
  setMatrixEditorOpen: (open: boolean) => void;
  setContextCreateFormOpen: (open: boolean) => void;
  setContextLibraryDialogOpen: (open: boolean) => void;
  setMatrixTemplateLibraryDialogOpen: (open: boolean) => void;
  setMatrixTemplateSaveDialogOpen: (open: boolean) => void;
  setMainView: (view: MainView) => void;

  // Question operations (these will be used by components to update form)
  reorderQuestions: (
    questions: AssignmentQuestionWithTopic[],
    oldIndex: number,
    newIndex: number
  ) => AssignmentQuestionWithTopic[];

  // Matrix sync helper
  syncMatrixCounts: (
    questions: AssignmentQuestionWithTopic[],
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
      isQuestionListDialogOpen: false,
      currentQuestionId: null,
      currentContextId: null,
      questionViewModes: new Map(),
      isMetadataDialogOpen: false,
      isMatrixEditorOpen: false,
      isContextCreateFormOpen: false,
      isContextLibraryDialogOpen: false,
      isMatrixTemplateLibraryDialogOpen: false,
      isMatrixTemplateSaveDialogOpen: false,
      mainView: 'info',

      // UI actions
      setSelectedQuestion: (id) => set({ selectedQuestionId: id }),
      setQuestionBankOpen: (open) => set({ isQuestionBankOpen: open }),
      setQuestionListDialogOpen: (open) => set({ isQuestionListDialogOpen: open }),
      // Setting currentQuestionId clears currentContextId (mutually exclusive)
      setCurrentQuestionId: (id) => set({ currentQuestionId: id, currentContextId: null }),
      // Setting currentContextId clears currentQuestionId (mutually exclusive)
      setCurrentContextId: (id) => set({ currentContextId: id, currentQuestionId: null }),
      setMainView: (view) => set({ mainView: view }),
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
      setContextCreateFormOpen: (open) => set({ isContextCreateFormOpen: open }),
      setContextLibraryDialogOpen: (open) => set({ isContextLibraryDialogOpen: open }),
      setMatrixTemplateLibraryDialogOpen: (open) => set({ isMatrixTemplateLibraryDialogOpen: open }),
      setMatrixTemplateSaveDialogOpen: (open) => set({ isMatrixTemplateSaveDialogOpen: open }),

      // Reorder questions (used with drag-drop)
      reorderQuestions: (questions, oldIndex, newIndex) => {
        const newQuestions = [...questions];
        const [movedQuestion] = newQuestions.splice(oldIndex, 1);
        newQuestions.splice(newIndex, 0, movedQuestion);
        return newQuestions;
      },

      // Sync matrix counts based on current questions
      syncMatrixCounts: (questions, _topics, matrixCells) => {
        const counts = new Map<string, number>();

        questions.forEach((aq) => {
          if (aq.question.topicId && aq.question.difficulty && aq.question.type) {
            const key = createCellId(aq.question.topicId, aq.question.difficulty, aq.question.type);
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });

        return matrixCells.map((cell) => ({
          ...cell,
          currentCount: counts.get(createCellId(cell.topicId, cell.difficulty, cell.questionType)) || 0,
        }));
      },
    }),
    { name: 'AssignmentEditor' }
  )
);
