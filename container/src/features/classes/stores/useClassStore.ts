import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Class, Student, Teacher } from '../types';

interface ClassFilters {
  search?: string;
  grade?: number;
  academicYear?: string;
  homeroomTeacherId?: string;
  isActive?: boolean;
}

interface ClassStore {
  // Selected items
  selectedClass: Class | null;
  selectedStudents: Student[];
  selectedTeachers: Teacher[];

  // Filters and view state
  filters: ClassFilters;
  viewMode: 'list' | 'grid';
  sortBy: string;
  sortDirection: 'asc' | 'desc';

  // Form state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isEnrollmentModalOpen: boolean;
  isTeacherAssignmentModalOpen: boolean;

  // Loading states for complex operations
  isTransferringStudent: boolean;
  isAssigningTeacher: boolean;

  // Actions - Selection
  setSelectedClass: (classData: Class | null) => void;
  setSelectedStudents: (students: Student[]) => void;
  setSelectedTeachers: (teachers: Teacher[]) => void;
  addSelectedStudent: (student: Student) => void;
  removeSelectedStudent: (studentId: string) => void;
  clearSelectedStudents: () => void;

  // Actions - Filters and view
  setFilters: (filters: Partial<ClassFilters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setSorting: (sortBy: string, direction: 'asc' | 'desc') => void;

  // Actions - Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (classData: Class) => void;
  closeEditModal: () => void;
  openEnrollmentModal: (classData: Class) => void;
  closeEnrollmentModal: () => void;
  openTeacherAssignmentModal: (classData: Class) => void;
  closeTeacherAssignmentModal: () => void;

  // Actions - Loading states
  setTransferringStudent: (isTransferring: boolean) => void;
  setAssigningTeacher: (isAssigning: boolean) => void;

  // Actions - Utility
  reset: () => void;
}

const initialState = {
  selectedClass: null,
  selectedStudents: [],
  selectedTeachers: [],
  filters: {},
  viewMode: 'list' as const,
  sortBy: 'name',
  sortDirection: 'asc' as const,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isEnrollmentModalOpen: false,
  isTeacherAssignmentModalOpen: false,
  isTransferringStudent: false,
  isAssigningTeacher: false,
};

const useClassStore = create<ClassStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Selection actions
        setSelectedClass: (classData) => set({ selectedClass: classData }),

        setSelectedStudents: (students) => set({ selectedStudents: students }),

        setSelectedTeachers: (teachers) => set({ selectedTeachers: teachers }),

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

        openTeacherAssignmentModal: (classData) =>
          set({
            selectedClass: classData,
            isTeacherAssignmentModalOpen: true,
          }),

        closeTeacherAssignmentModal: () =>
          set({
            isTeacherAssignmentModalOpen: false,
            selectedClass: null,
          }),

        // Loading state actions
        setTransferringStudent: (isTransferring) => set({ isTransferringStudent: isTransferring }),

        setAssigningTeacher: (isAssigning) => set({ isAssigningTeacher: isAssigning }),

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
