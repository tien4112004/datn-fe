import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type MainView = 'info' | 'questions' | 'matrix';

interface AssignmentViewerState {
  // UI State
  mainView: MainView;
  currentQuestionId: string | null;

  // Actions
  setMainView: (view: MainView) => void;
  setCurrentQuestionId: (id: string | null) => void;
  reset: () => void;
}

export const useAssignmentViewerStore = create<AssignmentViewerState>()(
  devtools(
    (set) => ({
      // Initial state
      mainView: 'info',
      currentQuestionId: null,

      // Actions
      setMainView: (view) => set({ mainView: view }),
      setCurrentQuestionId: (id) => set({ currentQuestionId: id }),
      reset: () => set({ mainView: 'info', currentQuestionId: null }),
    }),
    { name: 'AssignmentViewer' }
  )
);
