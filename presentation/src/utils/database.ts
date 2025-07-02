import Dexie, { type EntityTable } from 'dexie';
import { databaseId } from '@/store/main';
import type { Slide } from '@/types/slides';
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/configs/storage';

export interface writingBoardImg {
  id: string;
  dataURL: string;
}

export interface Snapshot {
  id: number;
  index: number;
  slides: Slide[];
}

const databaseNamePrefix = 'PPTist';

// Delete invalid/expired databases
// When the application closes (closing or refreshing the browser), the database ID will be recorded in localStorage, indicating that the database pointed to by this ID is invalid
// When the application initializes, check all current databases and delete those recorded as invalid
// Additionally, databases that are more than 12 hours old from initialization time will also be deleted (this is to prevent accidentally undeleted databases)
export const deleteDiscardedDB = async () => {
  const now = new Date().getTime();

  const localStorageDiscardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB);
  const localStorageDiscardedDBList: string[] = localStorageDiscardedDB
    ? JSON.parse(localStorageDiscardedDB)
    : [];

  const databaseNames = await Dexie.getDatabaseNames();
  const discardedDBNames = databaseNames.filter((name) => {
    if (name.indexOf(databaseNamePrefix) === -1) return false;

    const [prefix, id, time] = name.split('_');
    if (prefix !== databaseNamePrefix || !id || !time) return true;
    if (localStorageDiscardedDBList.includes(id)) return true;
    if (now - +time >= 1000 * 60 * 60 * 12) return true;

    return false;
  });

  for (const name of discardedDBNames) Dexie.delete(name);
  localStorage.removeItem(LOCALSTORAGE_KEY_DISCARDED_DB);
};

const db = new Dexie(`${databaseNamePrefix}_${databaseId}_${new Date().getTime()}`) as Dexie & {
  snapshots: EntityTable<Snapshot, 'id'>;
  writingBoardImgs: EntityTable<writingBoardImg, 'id'>;
};

db.version(1).stores({
  snapshots: '++id',
  writingBoardImgs: 'id',
});

export { db };
