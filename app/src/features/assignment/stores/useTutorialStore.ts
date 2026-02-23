import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface TutorialState {
  hasSeenTutorial: boolean;
  isActive: boolean;
  currentStepIndex: number;
}

interface TutorialActions {
  startTutorial: () => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  markAsSeen: () => void;
  resetSeen: () => void;
}

type TutorialStore = TutorialState & TutorialActions;

const useTutorialStore = create<TutorialStore>()(
  devtools(
    persist(
      (set) => ({
        hasSeenTutorial: false,
        isActive: false,
        currentStepIndex: 0,

        startTutorial: () => set({ isActive: true, currentStepIndex: 0 }),

        stopTutorial: () => set({ isActive: false, currentStepIndex: 0, hasSeenTutorial: true }),

        nextStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),

        prevStep: () =>
          set((state) => ({
            currentStepIndex: Math.max(0, state.currentStepIndex - 1),
          })),

        goToStep: (index: number) => set({ currentStepIndex: index }),

        markAsSeen: () => set({ hasSeenTutorial: true }),

        resetSeen: () => set({ hasSeenTutorial: false }),
      }),
      {
        name: 'assignment-editor-tutorial',
        partialize: (state) => ({
          hasSeenTutorial: state.hasSeenTutorial,
        }),
      }
    ),
    {
      name: 'assignment-editor-tutorial',
    }
  )
);

export { useTutorialStore };
