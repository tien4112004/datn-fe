import { initial } from 'lodash';
import { defineStore } from 'pinia';

export interface ContainerState {
  titleTest: string;
}

export const useContainerStore = defineStore('container', {
  state: (): ContainerState => ({
    titleTest: '',
  }),

  getters: {
    getTitleTest(state) {
      return state.titleTest;
    },
  },

  actions: {
    initialize(data: Partial<ContainerState>) {
      this.titleTest = data?.titleTest || '';
    }
  },
});
