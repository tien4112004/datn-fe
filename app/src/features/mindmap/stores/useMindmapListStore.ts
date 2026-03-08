import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SortingState, PaginationState } from '@tanstack/react-table';
import type { DocumentFilterValues } from '@/features/projects/components/DocumentFilters';

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 20 };
const DEFAULT_SORTING: SortingState = [{ id: 'updatedAt', desc: true }];

interface MindmapListState {
  search: string;
  sorting: SortingState;
  pagination: PaginationState;
  documentFilters: DocumentFilterValues;
  setSearch: (search: string) => void;
  setSorting: (sorting: SortingState) => void;
  setPagination: (pagination: PaginationState) => void;
  setDocumentFilters: (filters: DocumentFilterValues) => void;
  reset: () => void;
}

export const useMindmapListStore = create<MindmapListState>()(
  persist(
    (set) => ({
      search: '',
      sorting: DEFAULT_SORTING,
      pagination: DEFAULT_PAGINATION,
      documentFilters: {},
      setSearch: (search) => set({ search, pagination: { ...DEFAULT_PAGINATION } }),
      setSorting: (sorting) => set({ sorting, pagination: { ...DEFAULT_PAGINATION } }),
      setPagination: (pagination) => set({ pagination }),
      setDocumentFilters: (documentFilters) =>
        set({ documentFilters, pagination: { ...DEFAULT_PAGINATION } }),
      reset: () =>
        set({ search: '', sorting: DEFAULT_SORTING, pagination: DEFAULT_PAGINATION, documentFilters: {} }),
    }),
    { name: 'mindmap-list-store' }
  )
);
