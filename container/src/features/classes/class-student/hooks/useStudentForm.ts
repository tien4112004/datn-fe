import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Student } from '../types/student';

/**
 * Student form validation schema
 * Used by React Hook Form with zodResolver for roster management
 *
 * Validates required fields (fullName) and optional fields
 */
export const studentFormSchema = z.object({
  // Required fields
  fullName: z
    .string({ message: 'roster.validation.fullNameRequired' })
    .min(1, { message: 'roster.validation.fullNameRequired' })
    .max(200, { message: 'roster.validation.fullNameTooLong' }),

  // Optional fields
  address: z.string().max(500, { message: 'roster.validation.addressTooLong' }).optional().or(z.literal('')),

  parentName: z
    .string()
    .max(100, { message: 'roster.validation.parentNameTooLong' })
    .optional()
    .or(z.literal('')),

  parentPhone: z
    .string()
    .max(20, { message: 'roster.validation.parentPhoneTooLong' })
    .optional()
    .or(z.literal('')),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'roster.validation.dateOfBirthInvalid' }),

  gender: z.enum(['male', 'female', 'other'], { message: 'roster.validation.genderInvalid' }).optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

export type StudentFormMode = 'create' | 'edit';

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
          fullName: initialData.fullName,
          address: initialData.address || '',
          parentName: initialData.parentName || '',
          parentPhone: initialData.parentPhone || '',
          dateOfBirth: initialData.dateOfBirth || '',
          gender: initialData.gender,
        }
      : {
          fullName: '',
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
