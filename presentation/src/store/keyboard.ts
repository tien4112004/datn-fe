import { defineStore } from 'pinia';

export interface KeyboardState {
  ctrlKeyState: boolean;
  shiftKeyState: boolean;
  spaceKeyState: boolean;
}

export const useKeyboardStore = defineStore('keyboard', {
  state: (): KeyboardState => ({
    ctrlKeyState: false, // ctrl key pressed state
    shiftKeyState: false, // shift key pressed state
    spaceKeyState: false, // space key pressed state
  }),

  getters: {
    ctrlOrShiftKeyActive(state) {
      return state.ctrlKeyState || state.shiftKeyState;
    },
  },

  actions: {
    setCtrlKeyState(active: boolean) {
      this.ctrlKeyState = active;
    },
    setShiftKeyState(active: boolean) {
      this.shiftKeyState = active;
    },
    setSpaceKeyState(active: boolean) {
      this.spaceKeyState = active;
    },
  },
});
