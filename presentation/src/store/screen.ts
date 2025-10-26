import { defineStore } from 'pinia';

export interface ScreenState {
  screening: boolean;
  presenter: boolean;
}

export const useScreenStore = defineStore('screen', {
  state: (): ScreenState => ({
    screening: false, // Whether to enter presentation mode
    presenter: false, // Whether to enter presenter mode
  }),

  actions: {
    setScreening(screening: boolean) {
      this.screening = screening;
    },

    setPresenter(presenter: boolean) {
      this.presenter = presenter;
    },
  },
});
