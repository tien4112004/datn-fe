import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaginationState, Updater } from '@tanstack/react-table';
import type { DocumentFilterValues } from '@/features/projects/components/DocumentFilters';

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 20 };

interface AssignmentListState {
  search: string;
  pagination: PaginationState;
  documentFilters: DocumentFilterValues;
  setSearch: (search: string) => void;
  setPagination: (updaterOrValue: Updater<PaginationState>) => void;
  setDocumentFilters: (filters: DocumentFilterValues) => void;
  reset: () => void;
}

export const useAssignmentListStore = create<AssignmentListState>()(
  persist(
    (set, get) => ({
      search: '',
      pagination: DEFAULT_PAGINATION,
      documentFilters: {},
      setSearch: (search) => set({ search, pagination: { ...DEFAULT_PAGINATION } }),
      setPagination: (updaterOrValue) => {
        const pagination =
          typeof updaterOrValue === 'function' ? updaterOrValue(get().pagination) : updaterOrValue;
        set({ pagination });
      },
      setDocumentFilters: (documentFilters) =>
        set({ documentFilters, pagination: { ...DEFAULT_PAGINATION } }),
      reset: () => set({ search: '', pagination: DEFAULT_PAGINATION, documentFilters: {} }),
    }),
    { name: 'assignment-list-store' }
  )
);
