import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type MainView = 'info' | 'questions' | 'matrix' | 'contexts' | 'questionsList';

interface AssignmentViewerState {
  // UI State
  mainView: MainView;
  currentQuestionId: string | null;
  currentContextId: string | null; // Selected context group (mutually exclusive with currentQuestionId)

  // Actions
  setMainView: (view: MainView) => void;
  setCurrentQuestionId: (id: string | null) => void;
  setCurrentContextId: (id: string | null) => void;
  reset: () => void;
}

export const useAssignmentViewerStore = create<AssignmentViewerState>()(
  devtools(
    (set) => ({
      // Initial state
      mainView: 'info',
      currentQuestionId: null,
      currentContextId: null,

      // Actions
      setMainView: (view) => set({ mainView: view }),
      // Setting currentQuestionId clears currentContextId (mutually exclusive)
      setCurrentQuestionId: (id) => set({ currentQuestionId: id, currentContextId: null }),
      // Setting currentContextId clears currentQuestionId (mutually exclusive)
      setCurrentContextId: (id) => set({ currentContextId: id, currentQuestionId: null }),
      reset: () => set({ mainView: 'info', currentQuestionId: null, currentContextId: null }),
    }),
    { name: 'AssignmentViewer' }
  )
);
