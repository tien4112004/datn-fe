import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * Class form validation schema
 * Used by React Hook Form with zodResolver for class management
 *
 * Validates required fields (name, grade, academicYear)
 * and optional fields (classroom, description)
 */
export const classSchema = z
  .object({
    // Required fields
    name: z
      .string({ message: 'classes.form.validation.nameRequired' })
      .min(3, { message: 'classes.form.validation.nameTooShort' })
      .max(100, { message: 'classes.form.validation.nameTooLong' }),

    grade: z.coerce
      .number({ message: 'classes.form.validation.gradeRequired' })
      .min(1, { message: 'classes.form.validation.gradeInvalid' })
      .max(12, { message: 'classes.form.validation.gradeInvalid' }),

    academicYear: z
      .string({ message: 'classes.form.validation.academicYearRequired' })
      .regex(/^\d{4}-\d{4}$/, { message: 'classes.form.validation.academicYearInvalid' }),

    // Optional fields
    classroom: z
      .string()
      .max(100, { message: 'classes.form.validation.classroomTooLong' })
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
      grade: 1,
      academicYear: '',
      classroom: undefined,
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
