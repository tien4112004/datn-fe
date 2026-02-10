import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  AssignmentTopic,
  AssignmentQuestionWithTopic,
  MatrixCell,
  AssignmentContext,
  AssignmentValidationErrors,
} from '../types';
import { generateId, createCellId } from '@aiprimary/core';

/**
 * Sync matrix cell counts based on current questions
 * This runs automatically whenever questions change
 * Now includes questionType in the matching key
 */
function syncMatrixCounts(questions: AssignmentQuestionWithTopic[], matrixCells: MatrixCell[]): MatrixCell[] {
  // Count questions by topic-difficulty-questionType combination
  const counts = new Map<string, number>();

  questions.forEach((aq) => {
    if (aq.question.topicId && aq.question.difficulty && aq.question.type) {
      const key = createCellId(aq.question.topicId, aq.question.difficulty, aq.question.type);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });

  // Update currentCount for all cells
  const updatedCells = matrixCells.map((cell) => ({
    ...cell,
    currentCount: counts.get(createCellId(cell.topicId, cell.difficulty, cell.questionType)) || 0,
  }));

  return updatedCells;
}

/**
 * Dispatch dirty state event for unsaved changes blocker
 */
function dispatchDirtyEvent(isDirty: boolean): void {
  window.dispatchEvent(
    new CustomEvent('app.assignment.dirty-state-changed', {
      detail: { isDirty },
    })
  );
}

interface AssignmentFormStore {
  // === FORM DATA ===
  title: string;
  description: string;
  subject: string;
  grade: string;
  topics: AssignmentTopic[];
  questions: AssignmentQuestionWithTopic[];
  matrix: MatrixCell[];
  contexts: AssignmentContext[];
  shuffleQuestions: boolean;

  // === FORM STATE ===
  isDirty: boolean;
  validationErrors: AssignmentValidationErrors | null;

  // === ACTIONS: Metadata ===
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSubject: (subject: string) => void;
  setGrade: (grade: string) => void;
  setShuffleQuestions: (shuffle: boolean) => void;

  // === ACTIONS: Topics ===
  addTopic: (topic: AssignmentTopic) => void;
  removeTopic: (topicId: string) => void;
  updateTopic: (topicId: string, updates: Partial<AssignmentTopic>) => void;

  // === ACTIONS: Contexts ===
  addContext: (context: Omit<AssignmentContext, 'id'>) => string; // Returns new ID
  updateContext: (contextId: string, updates: Partial<AssignmentContext>) => void;
  removeContext: (contextId: string) => void;
  // === ACTIONS: Questions ===
  addQuestion: (question: AssignmentQuestionWithTopic) => void;
  removeQuestion: (index: number) => void;
  updateQuestion: (index: number, updates: Partial<AssignmentQuestionWithTopic>) => void;
  reorderQuestions: (oldIndex: number, newIndex: number) => void;

  // === ACTIONS: Matrix ===
  createMatrixCell: (cell: Omit<MatrixCell, 'id' | 'currentCount'>) => void;
  removeMatrixCell: (cellId: string) => void;
  updateMatrixCell: (cellId: string, updates: Partial<MatrixCell>) => void;
  syncMatrix: () => void; // Manual sync if needed

  // === GETTERS: Derived State ===
  getTotalPoints: () => number;
  getMatrixCellsWithValidation: () => MatrixCell[];

  // === ACTIONS: Validation ===
  setValidationErrors: (errors: AssignmentValidationErrors | null) => void;
  clearQuestionErrors: (questionId: string) => void;
  clearAssignmentFieldError: (field: 'title' | 'subject') => void;
  clearMatrixErrors: () => void;

  // === ACTIONS: Form State ===
  markDirty: () => void;
  markClean: () => void;
  reset: (data?: Partial<AssignmentFormStore>) => void;
  initialize: (data: {
    title?: string;
    description?: string;
    subject?: string;
    grade?: string;
    topics?: AssignmentTopic[];
    questions?: AssignmentQuestionWithTopic[];
    matrix?: MatrixCell[];
    contexts?: AssignmentContext[];
    shuffleQuestions?: boolean;
  }) => void;
}

const initialState = {
  title: '',
  description: '',
  subject: '',
  grade: '',
  topics: [],
  questions: [],
  matrixCells: [],
  contexts: [] as AssignmentContext[],
  shuffleQuestions: false,
  isDirty: false,
  validationErrors: null,
};

export const useAssignmentFormStore = create<AssignmentFormStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === METADATA ACTIONS ===
      setTitle: (title) => {
        set({ title, isDirty: true }, false, 'assignment/setTitle');
        dispatchDirtyEvent(true);
        get().clearAssignmentFieldError('title');
      },

      setDescription: (description) => {
        set({ description, isDirty: true }, false, 'assignment/setDescription');
        dispatchDirtyEvent(true);
      },

      setSubject: (subject) => {
        set({ subject, isDirty: true }, false, 'assignment/setSubject');
        dispatchDirtyEvent(true);
        get().clearAssignmentFieldError('subject');
      },

      setGrade: (grade) => {
        set({ grade, isDirty: true }, false, 'assignment/setGrade');
        dispatchDirtyEvent(true);
      },

      setShuffleQuestions: (shuffleQuestions) => {
        set({ shuffleQuestions, isDirty: true }, false, 'assignment/setShuffleQuestions');
        dispatchDirtyEvent(true);
      },

      // === TOPIC ACTIONS ===
      addTopic: (topic) => {
        set(
          (state) => {
            const newTopics = [...state.topics, topic];
            return {
              topics: newTopics,
              isDirty: true,
            };
          },
          false,
          'assignment/addTopic'
        );
        dispatchDirtyEvent(true);
      },

      removeTopic: (topicId) => {
        set(
          (state) => {
            const newTopics = state.topics.filter((t) => t.id !== topicId);
            const newMatrixCells = state.matrix.filter((c) => c.topicId !== topicId);
            const newQuestions = state.questions.filter((q) => q.question.topicId !== topicId);

            return {
              topics: newTopics,
              matrix: newMatrixCells,
              questions: newQuestions,
              isDirty: true,
            };
          },
          false,
          'assignment/removeTopic'
        );
        dispatchDirtyEvent(true);
      },

      updateTopic: (topicId, updates) => {
        set(
          (state) => {
            const newTopics = state.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t));
            // Also update topicName in matrixCells if name changed
            const newMatrixCells =
              updates.name !== undefined
                ? state.matrix.map((c) => (c.topicId === topicId ? { ...c, topicName: updates.name! } : c))
                : state.matrix;

            return {
              topics: newTopics,
              matrix: newMatrixCells,
              isDirty: true,
            };
          },
          false,
          'assignment/updateTopic'
        );
        dispatchDirtyEvent(true);
      },

      // === CONTEXT ACTIONS ===
      addContext: (context) => {
        const newId = generateId();
        set(
          (state) => ({
            contexts: [...state.contexts, { ...context, id: newId }],
            isDirty: true,
          }),
          false,
          'assignment/addContext'
        );
        dispatchDirtyEvent(true);
        return newId;
      },

      updateContext: (contextId, updates) => {
        set(
          (state) => ({
            contexts: state.contexts.map((c) => (c.id === contextId ? { ...c, ...updates } : c)),
            isDirty: true,
          }),
          false,
          'assignment/updateContext'
        );
        dispatchDirtyEvent(true);
      },

      removeContext: (contextId) => {
        set(
          (state) => {
            // Remove the context
            const newContexts = state.contexts.filter((c) => c.id !== contextId);
            // Clear contextId from all questions that reference this context
            const newQuestions = state.questions.map((q) => {
              if ((q.question as any).contextId === contextId) {
                const { contextId: _, ...questionWithoutContext } = q.question as any;
                return { ...q, question: questionWithoutContext };
              }
              return q;
            });

            return {
              contexts: newContexts,
              questions: newQuestions,
              isDirty: true,
            };
          },
          false,
          'assignment/removeContext'
        );
        dispatchDirtyEvent(true);
      },

      // === QUESTION ACTIONS ===
      addQuestion: (question) => {
        set(
          (state) => {
            let newTopics = [...state.topics];

            const q = question.question;

            // Auto-expand: Add topic if not exists (cells will be created on demand)
            if (q.topicId && !newTopics.find((t) => t.id === q.topicId)) {
              const newTopic = { id: q.topicId, name: q.topicId }; // User should edit name
              newTopics.push(newTopic);
            }

            const newQuestions = [...state.questions, question];
            const updatedCells = syncMatrixCounts(newQuestions, state.matrix);

            return {
              topics: newTopics,
              questions: newQuestions,
              matrix: updatedCells,
              isDirty: true,
            };
          },
          false,
          'assignment/addQuestion'
        );
        dispatchDirtyEvent(true);
      },

      removeQuestion: (index) => {
        set(
          (state) => {
            const newQuestions = state.questions.filter((_, i) => i !== index);
            const updatedCells = syncMatrixCounts(newQuestions, state.matrix);

            return {
              questions: newQuestions,
              matrix: updatedCells,
              isDirty: true,
            };
          },
          false,
          'assignment/removeQuestion'
        );
        dispatchDirtyEvent(true);
      },

      updateQuestion: (index, updates) => {
        const questionId = get().questions[index]?.question?.id;
        set(
          (state) => {
            const newQuestions = state.questions.map((q, i) => {
              if (i !== index) return q;
              return {
                ...q,
                ...updates,
                question: updates.question ? { ...q.question, ...updates.question } : q.question,
              };
            });
            const updatedCells = syncMatrixCounts(newQuestions, state.matrix);

            return {
              questions: newQuestions,
              matrix: updatedCells,
              isDirty: true,
            };
          },
          false,
          'assignment/updateQuestion'
        );
        dispatchDirtyEvent(true);
        if (questionId) {
          get().clearQuestionErrors(questionId);
        }
      },

      reorderQuestions: (oldIndex, newIndex) => {
        set(
          (state) => {
            const newQuestions = [...state.questions];
            const [removed] = newQuestions.splice(oldIndex, 1);
            newQuestions.splice(newIndex, 0, removed);

            return {
              questions: newQuestions,
              isDirty: true,
            };
          },
          false,
          'assignment/reorderQuestions'
        );
        dispatchDirtyEvent(true);
      },

      // === MATRIX ACTIONS ===
      createMatrixCell: (cell) => {
        set(
          (state) => {
            const cellId = createCellId(cell.topicId, cell.difficulty, cell.questionType);
            // Check if cell already exists
            const existingCell = state.matrix.find((c) => c.id === cellId);
            if (existingCell) {
              return state; // Cell already exists, don't create duplicate
            }

            const newCell: MatrixCell = {
              ...cell,
              id: cellId,
              currentCount: 0,
            };

            const newMatrix = [...state.matrix, newCell];
            return {
              matrix: syncMatrixCounts(state.questions, newMatrix),
              isDirty: true,
            };
          },
          false,
          'assignment/createMatrixCell'
        );
        dispatchDirtyEvent(true);
      },

      removeMatrixCell: (cellId) => {
        set(
          (state) => ({
            matrix: state.matrix.filter((c) => c.id !== cellId),
            isDirty: true,
          }),
          false,
          'assignment/removeMatrixCell'
        );
        dispatchDirtyEvent(true);
      },

      updateMatrixCell: (cellId, updates) => {
        set(
          (state) => ({
            matrix: state.matrix.map((c) => (c.id === cellId ? { ...c, ...updates } : c)),
            isDirty: true,
          }),
          false,
          'assignment/updateMatrixCell'
        );
        dispatchDirtyEvent(true);
        get().clearMatrixErrors();
      },

      syncMatrix: () =>
        set(
          (state) => ({
            matrix: syncMatrixCounts(state.questions, state.matrix),
          }),
          false,
          'assignment/syncMatrix'
        ),

      // === GETTERS ===
      getTotalPoints: () => {
        const { questions } = get();
        return questions.reduce((sum, q) => sum + (q.points || 0), 0);
      },

      getMatrixCellsWithValidation: () => {
        const { matrix: matrixCells } = get();
        return matrixCells;
      },

      // === VALIDATION ACTIONS ===
      setValidationErrors: (validationErrors) => {
        set({ validationErrors }, false, 'assignment/setValidationErrors');
      },

      clearQuestionErrors: (questionId) => {
        set(
          (state) => {
            if (!state.validationErrors) return state;
            const newQuestions = { ...state.validationErrors.questions };
            delete newQuestions[questionId];
            return {
              validationErrors: {
                ...state.validationErrors,
                questions: newQuestions,
              },
            };
          },
          false,
          'assignment/clearQuestionErrors'
        );
      },

      clearAssignmentFieldError: (field) => {
        set(
          (state) => {
            if (!state.validationErrors) return state;
            const newAssignment = { ...state.validationErrors.assignment };
            delete newAssignment[field];
            return {
              validationErrors: {
                ...state.validationErrors,
                assignment: newAssignment,
              },
            };
          },
          false,
          'assignment/clearAssignmentFieldError'
        );
      },

      clearMatrixErrors: () => {
        set(
          (state) => {
            if (!state.validationErrors?.matrix) return state;
            return {
              validationErrors: {
                ...state.validationErrors,
                matrix: undefined,
              },
            };
          },
          false,
          'assignment/clearMatrixErrors'
        );
      },

      // === FORM STATE ACTIONS ===
      markDirty: () => {
        set({ isDirty: true }, false, 'assignment/markDirty');
        dispatchDirtyEvent(true);
      },

      markClean: () => {
        set({ isDirty: false }, false, 'assignment/markClean');
        dispatchDirtyEvent(false);
      },

      reset: (data) => {
        const newState = { ...initialState, ...data };
        set(newState, false, 'assignment/reset');
        dispatchDirtyEvent(false);
      },

      initialize: (data) => {
        const newState = {
          title: data.title || '',
          description: data.description || '',
          subject: data.subject || '',
          grade: data.grade || '',
          topics: data.topics || [],
          questions: data.questions || [],
          matrix: data.matrix || [],
          contexts: data.contexts || [],
          shuffleQuestions: data.shuffleQuestions || false,
          isDirty: false,
          validationErrors: null,
        };
        set(newState, false, 'assignment/initialize');
        dispatchDirtyEvent(false);
      },
    }),
    {
      name: 'AssignmentForm',
    }
  )
);
