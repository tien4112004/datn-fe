import { initial } from 'lodash';
import { defineStore } from 'pinia';

export interface ContainerState {
  titleTest: string;
  isRemote: boolean;
}

export const useContainerStore = defineStore('container', {
  state: (): ContainerState => ({
    titleTest: '',
    isRemote: false,
  }),

  getters: {
    getTitleTest(state) {
      return state.titleTest;
    },
  },

  actions: {
    initialize(data: Partial<ContainerState>) {
      this.titleTest = data?.titleTest || '';
      this.isRemote = data?.isRemote || false;
    },
  },
});
