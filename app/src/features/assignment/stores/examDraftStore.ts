import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { generateId } from '@/shared/lib/utils';
import type { ExamDraft, Question } from '@aiprimary/core';
import type { AssessmentMatrix } from '@/features/assessment-matrix/types';

interface ExamDraftStore {
  // State
  drafts: ExamDraft[];
  currentDraft: ExamDraft | null;

  // Actions
  createDraft: (
    matrix: AssessmentMatrix,
    questions: Question[],
    selections: Record<string, string>
  ) => ExamDraft;
  setCurrentDraft: (draft: ExamDraft | null) => void;
  deleteDraft: (id: string) => void;
  getAllDrafts: () => ExamDraft[];
  getDraftById: (id: string) => ExamDraft | undefined;
  updateDraft: (id: string, updates: Partial<ExamDraft>) => void;
}

export const useExamDraftStore = create<ExamDraftStore>()(
  devtools(
    persist(
      (set, get) => ({
        drafts: [],
        currentDraft: null,

        createDraft: (matrix, questions, selections) => {
          const draft: ExamDraft = {
            id: generateId(),
            name: `${matrix.name} - ${new Date().toLocaleDateString()}`,
            matrixId: matrix.id,
            matrixName: matrix.name,
            subjectCode: matrix.subjectCode,
            targetPoints: matrix.targetTotalPoints,
            questions,
            questionSelections: selections,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            drafts: [...state.drafts, draft],
            currentDraft: draft,
          }));

          return draft;
        },

        setCurrentDraft: (draft) => set({ currentDraft: draft }),

        deleteDraft: (id) =>
          set((state) => ({
            drafts: state.drafts.filter((d) => d.id !== id),
            currentDraft: state.currentDraft?.id === id ? null : state.currentDraft,
          })),

        getAllDrafts: () => get().drafts,

        getDraftById: (id) => get().drafts.find((d) => d.id === id),

        updateDraft: (id, updates) =>
          set((state) => ({
            drafts: state.drafts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
          })),
      }),
      {
        name: 'exam-draft-storage',
        partialize: (state) => ({ drafts: state.drafts }),
      }
    ),
    { name: 'ExamDraftStore' }
  )
);

export default useExamDraftStore;
