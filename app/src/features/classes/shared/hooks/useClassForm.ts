import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Class form validation schema
 * Used by React Hook Form with zodResolver for class management
 *
 * Validates required fields (name)
 * and optional fields (grade, academicYear, class, description)
 */
export const classSchema = z
  .object({
    // Required fields
    name: z
      .string({ message: 'classes.form.validation.nameRequired' })
      .min(3, { message: 'classes.form.validation.nameTooShort' })
      .max(100, { message: 'classes.form.validation.nameTooLong' }),

    // Optional fields
    grade: z.coerce
      .number({ message: 'classes.form.validation.gradeRequired' })
      .min(1, { message: 'classes.form.validation.gradeInvalid' })
      .max(12, { message: 'classes.form.validation.gradeInvalid' })
      .optional()
      .or(z.literal('')),

    academicYear: z
      .string()
      .regex(/^\d{4}-\d{4}$/, { message: 'classes.form.validation.academicYearInvalid' })
      .optional()
      .or(z.literal('')),

    class: z
      .string()
      .max(100, { message: 'classes.form.validation.classTooLong' })
      .optional()
      .or(z.literal('')),

    description: z
      .string()
      .max(500, { message: 'classes.form.validation.descriptionTooLong' })
      .optional()
      .or(z.literal('')),

    studentIds: z.array(z.string()).optional(), // Keeping this as it might be used internally
    schedule: z.string().datetime().optional(), // Keeping this as it might be in
  })
  .refine(
    (data) => {
      // Only validate academicYear format if it's provided
      if (!data.academicYear || data.academicYear === '') return true;
      const [startYear, endYear] = data.academicYear.split('-').map(Number);
      return endYear === startYear + 1;
    },
    {
      message: 'classes.form.validation.academicYearRangeInvalid',
      path: ['academicYear'],
    }
  );

/**
 * Inferred TypeScript type from Zod schema
 * Ensures compile-time type safety matches runtime validation
 */
export type ClassSchema = z.infer<typeof classSchema>;

interface UseClassFormProps {
  initialData?: ClassSchema;
  onSubmit: (data: ClassSchema) => Promise<void>;
}

export const useClassForm = ({ initialData, onSubmit }: UseClassFormProps) => {
  const [formData, setFormData] = useState<ClassSchema>(
    initialData || {
      name: '',
      grade: undefined,
      academicYear: '',
      class: undefined,
      description: undefined,
      studentIds: undefined,
      schedule: undefined,
    }
  );
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const validateForm = useCallback(async () => {
    try {
      await classSchema.parseAsync(formData);
      setErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.issues);
      }
      return false;
    }
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const isValid = await validateForm();
      if (isValid) {
        await onSubmit(formData);
      }
    },
    [formData, onSubmit, validateForm]
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    handleSubmit,
  };
};
