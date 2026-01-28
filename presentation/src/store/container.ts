import type { Presentation } from '@/types/slides';
import { initial } from 'lodash';
import { defineStore } from 'pinia';
import { markRaw } from 'vue';

export interface ContainerState {
  isRemote: boolean;
  presentation?: Presentation;
  mode: 'edit' | 'view';
  permission?: 'read' | 'comment' | 'edit';
  isStudent?: boolean;
}

export const useContainerStore = defineStore('container', {
  state: (): ContainerState => ({
    isRemote: false,
    presentation: undefined,
    mode: 'edit',
    permission: undefined,
    isStudent: false,
  }),

  actions: {
    initialize(data: Partial<ContainerState>) {
      this.isRemote = data?.isRemote || false;
      this.presentation = data?.presentation ? markRaw(data?.presentation as Presentation) : undefined;
      this.mode = data?.mode || 'edit';
      this.permission = data?.permission;
      this.isStudent = data?.isStudent || false;
    },
    setPermission(permission: 'read' | 'comment' | 'edit') {
      this.permission = permission;
    },
  },
});
