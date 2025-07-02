import { defineStore } from 'pinia';
import type { IndexableTypeArray } from 'dexie';
import { db, type Snapshot } from '@/utils/database';

import { useSlidesStore } from './slides';
import { useMainStore } from './main';

export interface ScreenState {
  snapshotCursor: number;
  snapshotLength: number;
}

export const useSnapshotStore = defineStore('snapshot', {
  state: (): ScreenState => ({
    snapshotCursor: -1, // History snapshot pointer
    snapshotLength: 0, // History snapshot length
  }),

  getters: {
    canUndo(state) {
      return state.snapshotCursor > 0;
    },
    canRedo(state) {
      return state.snapshotCursor < state.snapshotLength - 1;
    },
  },

  actions: {
    setSnapshotCursor(cursor: number) {
      this.snapshotCursor = cursor;
    },
    setSnapshotLength(length: number) {
      this.snapshotLength = length;
    },

    async initSnapshotDatabase() {
      const slidesStore = useSlidesStore();

      const newFirstSnapshot = {
        index: slidesStore.slideIndex,
        slides: JSON.parse(JSON.stringify(slidesStore.slides)),
      };
      await db.snapshots.add(newFirstSnapshot);
      this.setSnapshotCursor(0);
      this.setSnapshotLength(1);
    },

    async addSnapshot() {
      const slidesStore = useSlidesStore();

      // Get all snapshot IDs in the current indexeddb
      const allKeys = await db.snapshots.orderBy('id').keys();

      let needDeleteKeys: IndexableTypeArray = [];

      // Record the snapshot IDs to be deleted
      // If the current snapshot pointer is not at the last position, when adding a new snapshot, all snapshots after the current pointer should be deleted. The actual situation is:
      // User has undone multiple times before, and then perform an operation (add a new snapshot), then all snapshots that were undone should be deleted
      if (this.snapshotCursor >= 0 && this.snapshotCursor < allKeys.length - 1) {
        needDeleteKeys = allKeys.slice(this.snapshotCursor + 1);
      }

      // Add new snapshot
      const snapshot = {
        index: slidesStore.slideIndex,
        slides: JSON.parse(JSON.stringify(slidesStore.slides)),
      };
      await db.snapshots.add(snapshot);

      // Calculate current snapshot length, used to set snapshot pointer position (at this time, pointer should be at the last position, i.e., snapshot length - 1)
      let snapshotLength = allKeys.length - needDeleteKeys.length + 1;

      // If snapshot length exceeds length limit, head excess snapshots should be deleted
      const snapshotLengthLimit = 20;
      if (snapshotLength > snapshotLengthLimit) {
        needDeleteKeys.push(allKeys[0]);
        snapshotLength--;
      }

      // If snapshot number is greater than 1, need to ensure that after undo operation, page focus remains unchanged: that is, set the index of the second last snapshot to the current page index
      // https://github.com/pipipi-pikachu/PPTist/issues/27
      if (snapshotLength >= 2) {
        db.snapshots.update(allKeys[snapshotLength - 2] as number, {
          index: slidesStore.slideIndex,
        });
      }

      await db.snapshots.bulkDelete(needDeleteKeys as number[]);

      this.setSnapshotCursor(snapshotLength - 1);
      this.setSnapshotLength(snapshotLength);
    },

    async unDo() {
      if (this.snapshotCursor <= 0) return;

      const slidesStore = useSlidesStore();
      const mainStore = useMainStore();

      const snapshotCursor = this.snapshotCursor - 1;
      const snapshots: Snapshot[] = await db.snapshots.orderBy('id').toArray();
      const snapshot = snapshots[snapshotCursor];
      const { index, slides } = snapshot;

      const slideIndex = index > slides.length - 1 ? slides.length - 1 : index;

      slidesStore.setSlides(slides);
      slidesStore.updateSlideIndex(slideIndex);
      this.setSnapshotCursor(snapshotCursor);
      mainStore.setActiveElementIdList([]);
    },

    async reDo() {
      if (this.snapshotCursor >= this.snapshotLength - 1) return;

      const slidesStore = useSlidesStore();
      const mainStore = useMainStore();

      const snapshotCursor = this.snapshotCursor + 1;
      const snapshots: Snapshot[] = await db.snapshots.orderBy('id').toArray();
      const snapshot = snapshots[snapshotCursor];
      const { index, slides } = snapshot;

      const slideIndex = index > slides.length - 1 ? slides.length - 1 : index;

      slidesStore.setSlides(slides);
      slidesStore.updateSlideIndex(slideIndex);
      this.setSnapshotCursor(snapshotCursor);
      mainStore.setActiveElementIdList([]);
    },
  },
});
