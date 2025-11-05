import type { Presentation } from '@/types/slides';
import { initial } from 'lodash';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

export interface ContainerState {
  titleTest: string;
  isRemote: boolean;
  presentation?: Presentation;
  mode: 'edit' | 'view';
}

export const useContainerStore = defineStore('container', {
  state: (): ContainerState => ({
    titleTest: '',
    isRemote: false,
    presentation: undefined,
    mode: 'edit',
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
      this.mode = data?.mode || 'edit';
    },
  },
});
