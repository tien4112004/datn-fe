import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SortingState, PaginationState, Updater } from '@tanstack/react-table';
import type { DocumentFilterValues } from '@/features/projects/components/DocumentFilters';

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 20 };
const DEFAULT_SORTING: SortingState = [{ id: 'createdAt', desc: true }];

interface PresentationListState {
  search: string;
  sorting: SortingState;
  pagination: PaginationState;
  documentFilters: DocumentFilterValues;
  setSearch: (search: string) => void;
  setSorting: (sorting: SortingState) => void;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  setDocumentFilters: (filters: DocumentFilterValues) => void;
  reset: () => void;
}

export const usePresentationListStore = create<PresentationListState>()(
  persist(
    (set, get) => ({
      search: '',
      sorting: DEFAULT_SORTING,
      pagination: DEFAULT_PAGINATION,
      documentFilters: {},
      setSearch: (search) => set({ search, pagination: { ...DEFAULT_PAGINATION } }),
      setSorting: (sorting) => set({ sorting, pagination: { ...DEFAULT_PAGINATION } }),
      setPagination: (updaterOrValue) => {
        const pagination =
          typeof updaterOrValue === 'function' ? updaterOrValue(get().pagination) : updaterOrValue;
        set({ pagination });
      },
      setDocumentFilters: (documentFilters) =>
        set({ documentFilters, pagination: { ...DEFAULT_PAGINATION } }),
      reset: () =>
        set({ search: '', sorting: DEFAULT_SORTING, pagination: DEFAULT_PAGINATION, documentFilters: {} }),
    }),
    { name: 'presentation-list-store' }
  )
);
