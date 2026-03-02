import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Answer } from '@aiprimary/core';

interface DraftData {
  answers: Answer[];
  currentQuestionId: string | null;
  currentContextId: string | null;
}

interface SubmissionDraftState {
  drafts: Record<string, DraftData>;
  setDraft: (assignmentId: string, data: DraftData) => void;
  clearDraft: (assignmentId: string) => void;
}

const STORAGE_KEY = 'submission-drafts';

export const useSubmissionDraftStore = create<SubmissionDraftState>()(
  persist(
    (set) => ({
      drafts: {},

      setDraft: (assignmentId, data) =>
        set((state) => ({
          drafts: { ...state.drafts, [assignmentId]: data },
        })),

      clearDraft: (assignmentId) =>
        set((state) => {
          const { [assignmentId]: _, ...rest } = state.drafts;
          return { drafts: rest };
        }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
