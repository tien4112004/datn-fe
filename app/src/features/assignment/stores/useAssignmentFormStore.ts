import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AssignmentTopic, AssignmentQuestionWithTopic, MatrixCell, AssignmentContext } from '../types';
import { getAllDifficulties } from '@aiprimary/core';
import { generateId } from '@/shared/lib/utils';

/**
 * Sync matrix cell counts based on current questions
 * This runs automatically whenever questions change
 */
function syncMatrixCounts(questions: AssignmentQuestionWithTopic[], matrixCells: MatrixCell[]): MatrixCell[] {
  // Count questions by topic-difficulty combination
  const counts = new Map<string, number>();

  questions.forEach((aq) => {
    if (aq.question.topicId && aq.question.difficulty) {
      const key = `${aq.question.topicId}-${aq.question.difficulty}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });

  // Update currentCount for all cells
  const updatedCells = matrixCells.map((cell) => ({
    ...cell,
    currentCount: counts.get(`${cell.topicId}-${cell.difficulty}`) || 0,
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

/**
 * Create matrix cells for a new topic across all difficulties
 */
function createMatrixCellsForTopic(topicId: string): MatrixCell[] {
  const difficulties = getAllDifficulties();
  return difficulties.map((difficulty, index) => ({
    id: `${topicId}-${difficulty.value}-${Date.now()}-${index}`,
    topicId,
    difficulty: difficulty.value,
    requiredCount: 0,
    currentCount: 0,
  }));
}

interface AssignmentFormStore {
  // === FORM DATA ===
  title: string;
  description: string;
  subject: string;
  grade: string;
  topics: AssignmentTopic[];
  questions: AssignmentQuestionWithTopic[];
  matrixCells: MatrixCell[];
  contexts: AssignmentContext[]; // Cloned contexts for this assignment
  shuffleQuestions: boolean;

  // === FORM STATE ===
  isDirty: boolean;
  errors: Record<string, string>;

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
  updateMatrixCell: (cellId: string, updates: Partial<MatrixCell>) => void;
  syncMatrix: () => void; // Manual sync if needed

  // === GETTERS: Derived State ===
  getTotalPoints: () => number;
  getMatrixCellsWithValidation: () => MatrixCell[];

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
    matrixCells?: MatrixCell[];
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
  errors: {},
};

export const useAssignmentFormStore = create<AssignmentFormStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === METADATA ACTIONS ===
      setTitle: (title) => {
        set({ title, isDirty: true }, false, 'assignment/setTitle');
        dispatchDirtyEvent(true);
      },

      setDescription: (description) => {
        set({ description, isDirty: true }, false, 'assignment/setDescription');
        dispatchDirtyEvent(true);
      },

      setSubject: (subject) => {
        set({ subject, isDirty: true }, false, 'assignment/setSubject');
        dispatchDirtyEvent(true);
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
            const newCells = createMatrixCellsForTopic(topic.id);
            const allCells = [...state.matrixCells, ...newCells];

            return {
              topics: newTopics,
              matrixCells: allCells,
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
            const newMatrixCells = state.matrixCells.filter((c) => c.topicId !== topicId);
            const newQuestions = state.questions.filter((q) => q.question.topicId !== topicId);

            return {
              topics: newTopics,
              matrixCells: newMatrixCells,
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
          (state) => ({
            topics: state.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
            isDirty: true,
          }),
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
            const newQuestions = [...state.questions, question];
            const updatedCells = syncMatrixCounts(newQuestions, state.matrixCells);

            return {
              questions: newQuestions,
              matrixCells: updatedCells,
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
            const updatedCells = syncMatrixCounts(newQuestions, state.matrixCells);

            return {
              questions: newQuestions,
              matrixCells: updatedCells,
              isDirty: true,
            };
          },
          false,
          'assignment/removeQuestion'
        );
        dispatchDirtyEvent(true);
      },

      updateQuestion: (index, updates) => {
        set(
          (state) => {
            const newQuestions = state.questions.map((q, i) => (i === index ? { ...q, ...updates } : q));
            const updatedCells = syncMatrixCounts(newQuestions, state.matrixCells);

            return {
              questions: newQuestions,
              matrixCells: updatedCells,
              isDirty: true,
            };
          },
          false,
          'assignment/updateQuestion'
        );
        dispatchDirtyEvent(true);
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
      updateMatrixCell: (cellId, updates) => {
        set(
          (state) => ({
            matrixCells: state.matrixCells.map((c) => (c.id === cellId ? { ...c, ...updates } : c)),
            isDirty: true,
          }),
          false,
          'assignment/updateMatrixCell'
        );
        dispatchDirtyEvent(true);
      },

      syncMatrix: () =>
        set(
          (state) => ({
            matrixCells: syncMatrixCounts(state.questions, state.matrixCells),
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
        const { matrixCells } = get();
        return matrixCells;
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
          matrixCells: data.matrixCells || [],
          contexts: data.contexts || [],
          shuffleQuestions: data.shuffleQuestions || false,
          isDirty: false,
          errors: {},
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
