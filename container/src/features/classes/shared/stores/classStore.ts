import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Class, Student } from '../types';
import type { ClassesViewMode, ClassTabs } from '../types/ui';

interface ClassFilters {
  search?: string;
  grade?: number;
  academicYear?: string;
  isActive?: boolean;
}

interface ClassStore {
  // Global state for class management
  currentTab: ClassTabs;

  // Selected items
  selectedClass: Class | null;
  selectedStudents: Student[];

  // Filters and view state
  filters: ClassFilters;
  viewMode: ClassesViewMode;
  sortBy: string;
  sortDirection: 'asc' | 'desc';

  // Form state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isEnrollmentModalOpen: boolean;

  // Global Actions
  setCurrentTab: (tab: ClassTabs) => void;

  // Actions - Selection
  setSelectedClass: (classData: Class | null) => void;
  setSelectedStudents: (students: Student[]) => void;
  addSelectedStudent: (student: Student) => void;
  removeSelectedStudent: (studentId: string) => void;
  clearSelectedStudents: () => void;

  // Actions - Filters and view
  setFilters: (filters: Partial<ClassFilters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: ClassesViewMode) => void;
  setSorting: (sortBy: string, direction: 'asc' | 'desc') => void;

  // Actions - Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (classData: Class) => void;
  closeEditModal: () => void;
  openEnrollmentModal: (classData: Class) => void;
  closeEnrollmentModal: () => void;

  // Actions - Utility
  reset: () => void;
}

const initialState = {
  currentTab: 'teaching' as ClassTabs,
  selectedClass: null,
  selectedStudents: [],
  filters: {},
  viewMode: 'list' as const,
  sortBy: 'name',
  sortDirection: 'asc' as const,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isEnrollmentModalOpen: false,
};

const useClassStore = create<ClassStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Global actions
        setCurrentTab: (tab) => set({ currentTab: tab }),

        // Selection actions
        setSelectedClass: (classData) => set({ selectedClass: classData }),

        setSelectedStudents: (students) => set({ selectedStudents: students }),

        addSelectedStudent: (student) =>
          set((state) => {
            const exists = state.selectedStudents.some((s) => s.id === student.id);
            if (exists) return state;
            return { selectedStudents: [...state.selectedStudents, student] };
          }),

        removeSelectedStudent: (studentId) =>
          set((state) => ({
            selectedStudents: state.selectedStudents.filter((s) => s.id !== studentId),
          })),

        clearSelectedStudents: () => set({ selectedStudents: [] }),

        // Filters and view actions
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),

        clearFilters: () => set({ filters: {} }),

        setViewMode: (mode) => set({ viewMode: mode }),

        setSorting: (sortBy, direction) => set({ sortBy, sortDirection: direction }),

        // Modal actions
        openCreateModal: () => set({ isCreateModalOpen: true }),

        closeCreateModal: () => set({ isCreateModalOpen: false }),

        openEditModal: (classData) =>
          set({
            selectedClass: classData,
            isEditModalOpen: true,
          }),

        closeEditModal: () =>
          set({
            isEditModalOpen: false,
            selectedClass: null,
          }),

        openEnrollmentModal: (classData) =>
          set({
            selectedClass: classData,
            isEnrollmentModalOpen: true,
          }),

        closeEnrollmentModal: () =>
          set({
            isEnrollmentModalOpen: false,
            selectedClass: null,
          }),

        // Utility actions
        reset: () => set(initialState),
      }),
      {
        name: 'class-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          filters: state.filters,
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortDirection: state.sortDirection,
        }),
      }
    ),
    {
      name: 'class-store',
    }
  )
);

export default useClassStore;
