import { z } from 'zod';

/**
 * Email validation regex (RFC 5322 simplified)
 * Validates basic email structure: user@domain.tld
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Student form validation schema
 * Used by React Hook Form with zodResolver for roster management
 *
 * Validates required fields (firstName, lastName, studentCode, email)
 * and optional fields (phone, address, parentName, parentPhone, dateOfBirth, gender)
 */
export const studentFormSchema = z.object({
  // Required fields (FR-002)
  firstName: z
    .string({ message: 'roster.validation.firstNameRequired' })
    .min(1, { message: 'roster.validation.firstNameRequired' })
    .max(100, { message: 'roster.validation.firstNameTooLong' }),

  lastName: z
    .string({ message: 'roster.validation.lastNameRequired' })
    .min(1, { message: 'roster.validation.lastNameRequired' })
    .max(100, { message: 'roster.validation.lastNameTooLong' }),

  studentCode: z
    .string({ message: 'roster.validation.studentCodeRequired' })
    .min(1, { message: 'roster.validation.studentCodeRequired' })
    .max(50, { message: 'roster.validation.studentCodeTooLong' })
    .trim(),
  // Note: Uniqueness validation (FR-004) will be added in Phase 6 (T030) via refine()

  email: z
    .string({ message: 'roster.validation.emailRequired' })
    .min(1, { message: 'roster.validation.emailRequired' })
    .regex(emailRegex, { message: 'roster.validation.emailInvalid' }) // FR-003
    .max(255, { message: 'roster.validation.emailTooLong' }),

  // Optional fields
  phone: z.string().max(20, { message: 'roster.validation.phoneTooLong' }).optional().or(z.literal('')), // Allow empty string (HTML input default)

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

/**
 * Inferred TypeScript type from Zod schema
 * Ensures compile-time type safety matches runtime validation
 */
export type StudentFormData = z.infer<typeof studentFormSchema>;
