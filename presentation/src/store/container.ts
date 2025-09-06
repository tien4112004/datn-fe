import type { Presentation } from '@/types/slides';
import { initial } from 'lodash';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

export interface ContainerState {
  titleTest: string;
  isRemote: boolean;
  presentation?: Presentation;
}

export const useContainerStore = defineStore('container', {
  state: (): ContainerState => ({
    titleTest: '',
    isRemote: false,
    presentation: undefined,
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
      this.presentation = data?.presentation ? markRaw(data?.presentation as Presentation) : undefined;
    },
  },
});
