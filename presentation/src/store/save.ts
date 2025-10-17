import { defineStore } from 'pinia';

export interface SaveState {
  isDirty: boolean;
  lastSavedAt: number | null;
}

export const useSaveStore = defineStore('save', {
  state: (): SaveState => ({
    isDirty: false,
    lastSavedAt: null,
  }),

  getters: {
    hasUnsavedChanges(state) {
      return state.isDirty;
    },
  },

  actions: {
    markDirty() {
      this.isDirty = true;
      // Notify container about dirty state change
      window.dispatchEvent(
        new CustomEvent('app.presentation.dirty-state-changed', {
          detail: { isDirty: true },
        })
      );
    },

    markSaved() {
      this.isDirty = false;
      this.lastSavedAt = Date.now();
      // Notify container about dirty state change
      window.dispatchEvent(
        new CustomEvent('app.presentation.dirty-state-changed', {
          detail: { isDirty: false },
        })
      );
    },

    reset() {
      this.isDirty = false;
      this.lastSavedAt = null;
      // Notify container about dirty state change
      window.dispatchEvent(
        new CustomEvent('app.presentation.dirty-state-changed', {
          detail: { isDirty: false },
        })
      );
    },
  },
});
