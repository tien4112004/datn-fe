import type { Presentation } from '@/types/slides';
import { initial } from 'lodash';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

export interface ContainerState {
  isRemote: boolean;
  presentation?: Presentation;
  mode: 'edit' | 'view';
}

export const useContainerStore = defineStore('container', {
  state: (): ContainerState => ({
    isRemote: false,
    presentation: undefined,
    mode: 'edit',
  }),

  actions: {
    initialize(data: Partial<ContainerState>) {
      this.isRemote = data?.isRemote || false;
      this.presentation = data?.presentation ? markRaw(data?.presentation as Presentation) : undefined;
      this.mode = data?.mode || 'edit';
    },
  },
});
