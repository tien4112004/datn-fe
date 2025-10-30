import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useStudentForm, type StudentFormMode } from '../../../hooks/useStudentForm';
import { useStudentMutations } from '../../../hooks/useStudentMutations';
import type { Student } from '../../../types/entities/student';
import type { StudentFormData } from '../../../schemas/studentSchema';

export interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  mode?: StudentFormMode;
  initialData?: Student;
  onSuccess?: () => void;
}

/**
 * Dialog component for adding or editing students in a class roster
 *
 * Features:
 * - Create or edit mode based on props
 * - Real-time validation with inline error messages
 * - Required and optional field indicators
 * - Disabled submit during API call
 * - Auto-close on success
 * - Pre-filled form data in edit mode
 *
 * @example
 * ```tsx
 * // Create mode
 * <StudentFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   classId={classId}
 *   mode="create"
 * />
 *
 * // Edit mode
 * <StudentFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   classId={classId}
 *   mode="edit"
 *   initialData={selectedStudent}
 * />
 * ```
 */
export function StudentFormDialog({
  open,
  onOpenChange,
  classId,
  mode = 'create',
  initialData,
  onSuccess,
}: StudentFormDialogProps) {
  const { t } = useTranslation('classes', { keyPrefix: 'roster' });
  const { createStudent, isCreating, updateStudent, isUpdating } = useStudentMutations(classId);

  const form = useStudentForm({
    mode,
    initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
  } = form;

  // Determine loading state based on mode
  const isSubmitting = mode === 'create' ? isCreating : isUpdating;

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Pre-fill form data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      setValue('firstName', initialData.firstName);
      setValue('lastName', initialData.lastName);
      setValue('studentCode', initialData.studentCode);
      setValue('email', initialData.email || '');
      setValue('phone', initialData.phone || '');
      setValue('address', initialData.address || '');
      setValue('parentName', initialData.parentName || '');
      setValue('parentPhone', initialData.parentPhone || '');
      setValue('dateOfBirth', initialData.dateOfBirth || '');
      setValue('gender', initialData.gender);
    }
  }, [mode, initialData, open, setValue]);

  const onSubmit = handleSubmit((data: StudentFormData) => {
    if (mode === 'create') {
      createStudent.mutate(data, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
          onSuccess?.();
        },
      });
    } else if (mode === 'edit' && initialData) {
      updateStudent.mutate(
        {
          studentId: initialData.id,
          data,
        },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
            onSuccess?.();
          },
        }
      );
    }
  });

  const genderValue = watch('gender');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('addStudent') : t('editStudent')}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? t('form.createDescription') : t('form.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Required Fields Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('form.requiredInformation')}</h3>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t('form.firstName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder={t('form.firstNamePlaceholder')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t('form.lastName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder={t('form.lastNamePlaceholder')}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>

            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="studentCode">
                {t('form.studentCode')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="studentCode"
                {...register('studentCode')}
                placeholder={t('form.studentCodePlaceholder')}
                aria-invalid={!!errors.studentCode}
              />
              {errors.studentCode && <p className="text-sm text-red-500">{errors.studentCode.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('form.email')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('form.emailPlaceholder')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('form.optionalInformation')}</h3>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('form.phone')}</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder={t('form.phonePlaceholder')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('form.dateOfBirth')}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                aria-invalid={!!errors.dateOfBirth}
              />
              {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">{t('form.gender')}</Label>
              <Select
                value={genderValue}
                onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder={t('form.genderPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('form.genderMale')}</SelectItem>
                  <SelectItem value="female">{t('form.genderFemale')}</SelectItem>
                  <SelectItem value="other">{t('form.genderOther')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('form.address')}</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder={t('form.addressPlaceholder')}
                aria-invalid={!!errors.address}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            {/* Parent/Guardian Name */}
            <div className="space-y-2">
              <Label htmlFor="parentName">{t('form.parentName')}</Label>
              <Input
                id="parentName"
                {...register('parentName')}
                placeholder={t('form.parentNamePlaceholder')}
                aria-invalid={!!errors.parentName}
              />
              {errors.parentName && <p className="text-sm text-red-500">{errors.parentName.message}</p>}
            </div>

            {/* Parent/Guardian Phone */}
            <div className="space-y-2">
              <Label htmlFor="parentPhone">{t('form.parentPhone')}</Label>
              <Input
                id="parentPhone"
                {...register('parentPhone')}
                placeholder={t('form.parentPhonePlaceholder')}
                aria-invalid={!!errors.parentPhone}
              />
              {errors.parentPhone && <p className="text-sm text-red-500">{errors.parentPhone.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={!isValid || !isDirty || isSubmitting}>
              {isSubmitting
                ? t('form.saving', 'Saving...')
                : mode === 'create'
                  ? t('form.submit')
                  : t('form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
