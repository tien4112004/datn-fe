import { useEffect, useState } from 'react';
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
import { useStudentForm, type StudentFormData, type StudentFormMode, useStudentMutations } from '../../hooks';
import type { Student } from '../../types';
import { CredentialsDisplay } from '../common';

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
  const { t: tValidation } = useTranslation('classes', { keyPrefix: 'validation' });
  const { createStudent, isCreating, updateStudent, isUpdating } = useStudentMutations(classId);

  // Track created student with credentials
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);

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

  // Reset form and credentials when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setCreatedStudent(null);
    }
  }, [open, reset]);

  // Pre-fill form data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && open) {
      setValue('fullName', initialData.fullName);
      setValue('address', initialData.address || '');
      setValue('parentName', initialData.parentName);
      setValue('parentPhone', initialData.parentPhone);
      setValue('parentContactEmail', initialData.parentContactEmail || '');
      setValue('dateOfBirth', initialData.dateOfBirth || '');
      setValue('gender', initialData.gender);
    }
  }, [mode, initialData, open, setValue]);

  const onSubmit = handleSubmit((data: StudentFormData) => {
    if (mode === 'create') {
      createStudent.mutate(data, {
        onSuccess: (student) => {
          reset();
          // If credentials are present, show them instead of closing
          if (student.username && student.password && student.email) {
            setCreatedStudent(student);
          } else {
            onOpenChange(false);
            onSuccess?.();
          }
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

  const handleCloseCredentials = () => {
    setCreatedStudent(null);
    onOpenChange(false);
    onSuccess?.();
  };

  const genderValue = watch('gender');

  const getErrorMessage = (error: any) => {
    if (!error?.message) return '';
    // Error message is a i18n key from Zod schema, translate it
    const translated = tValidation(error.message as any);
    // If translation returns an object (multiple validation messages), extract first string value
    if (typeof translated === 'object' && translated !== null) {
      const firstKey = Object.keys(translated)[0];
      return (translated as Record<string, string>)[firstKey] || '';
    }
    return translated || '';
  };

  // Show credentials if student was just created with credentials
  if (createdStudent?.username && createdStudent?.password && createdStudent?.email) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('credentialsTitle', 'Student Created Successfully')}</DialogTitle>
            <DialogDescription>
              {t('credentialsDescription', 'Save these credentials - they will not be shown again')}
            </DialogDescription>
          </DialogHeader>

          <CredentialsDisplay
            username={createdStudent.username}
            password={createdStudent.password}
            email={createdStudent.email}
            studentName={createdStudent.fullName}
          />

          <DialogFooter>
            <Button onClick={handleCloseCredentials}>{t('closeCredentials', 'Done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t('form.fullName')} <span className="text-red-500">*</span>
              </Label>
              <Input id="fullName" {...register('fullName')} placeholder={t('form.fullNamePlaceholder')} />
              {errors.fullName && <p className="text-sm text-red-500">{getErrorMessage(errors.fullName)}</p>}
            </div>

            {/* Parent/Guardian Name */}
            <div className="space-y-2">
              <Label htmlFor="parentName">
                {t('form.parentName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="parentName"
                {...register('parentName')}
                placeholder={t('form.parentNamePlaceholder')}
              />
              {errors.parentName && (
                <p className="text-sm text-red-500">{getErrorMessage(errors.parentName)}</p>
              )}
            </div>

            {/* Parent/Guardian Phone */}
            <div className="space-y-2">
              <Label htmlFor="parentPhone">
                {t('form.parentPhone')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="parentPhone"
                {...register('parentPhone')}
                placeholder={t('form.parentPhonePlaceholder')}
              />
              {errors.parentPhone && (
                <p className="text-sm text-red-500">{getErrorMessage(errors.parentPhone)}</p>
              )}
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('form.optionalInformation')}</h3>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('form.dateOfBirth')}</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{getErrorMessage(errors.dateOfBirth)}</p>
              )}
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
              {errors.gender && <p className="text-sm text-red-500">{getErrorMessage(errors.gender)}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('form.address')}</Label>
              <Input id="address" {...register('address')} placeholder={t('form.addressPlaceholder')} />
              {errors.address && <p className="text-sm text-red-500">{getErrorMessage(errors.address)}</p>}
            </div>

            {/* Parent Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="parentContactEmail">{t('form.parentContactEmail', 'Parent Email')}</Label>
              <Input
                id="parentContactEmail"
                type="email"
                {...register('parentContactEmail')}
                placeholder={t('form.parentContactEmailPlaceholder', 'parent@example.com')}
              />
              {errors.parentContactEmail && (
                <p className="text-sm text-red-500">{getErrorMessage(errors.parentContactEmail)}</p>
              )}
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
