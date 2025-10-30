import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentFormSchema, type StudentFormData } from '../schemas/studentSchema';
import type { Student } from '../types/entities/student';

/**
 * Mode for the student form
 * - 'create': Adding a new student
 * - 'edit': Modifying an existing student
 */
export type StudentFormMode = 'create' | 'edit';

/**
 * Options for useStudentForm hook
 */
export interface UseStudentFormOptions {
  mode?: StudentFormMode;
  initialData?: Student;
  onSuccess?: () => void;
}

/**
 * Custom hook for managing student form state with React Hook Form + Zod validation
 *
 * Provides form management for both create and edit modes with:
 * - Automatic validation using Zod schema
 * - Form state tracking (isDirty, isValid, errors)
 * - Pre-filling for edit mode
 * - Type-safe form data
 *
 * @example
 * ```tsx
 * // Create mode
 * const form = useStudentForm({ mode: 'create' });
 *
 * // Edit mode with initial data
 * const form = useStudentForm({
 *   mode: 'edit',
 *   initialData: existingStudent
 * });
 *
 * // Access form state
 * const { isDirty, isValid, errors } = form.formState;
 * ```
 *
 * @see studentFormSchema - Zod validation schema
 * @see StudentFormData - TypeScript type for form data
 */
export function useStudentForm({ mode = 'create', initialData }: UseStudentFormOptions = {}) {
  // Convert Student entity to StudentFormData for editing
  const defaultValues: Partial<StudentFormData> =
    mode === 'edit' && initialData
      ? {
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          studentCode: initialData.studentCode,
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          parentName: initialData.parentName || '',
          parentPhone: initialData.parentPhone || '',
          dateOfBirth: initialData.dateOfBirth || '',
          gender: initialData.gender,
        }
      : {
          firstName: '',
          lastName: '',
          studentCode: '',
          email: '',
          phone: '',
          address: '',
          parentName: '',
          parentPhone: '',
          dateOfBirth: '',
        };

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues,
    mode: 'onChange', // Validate on every change for immediate feedback
  });

  return {
    ...form,
    mode,
  };
}
