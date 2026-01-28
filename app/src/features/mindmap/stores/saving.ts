import { create } from 'zustand';

interface SavingState {
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  isDuplicating: boolean;
  setIsDuplicating: (isDuplicating: boolean) => void;
}

export const useSavingStore = create<SavingState>((set) => ({
  isSaving: false,
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  isDuplicating: false,
  setIsDuplicating: (isDuplicating: boolean) => set({ isDuplicating }),
}));
