import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldError } from 'react-hook-form';
import { format } from 'date-fns';
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
import { Calendar } from '@ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useStudentForm, type StudentFormData, type StudentFormMode, useStudentMutations } from '../../hooks';
import type { Student } from '../../types';
import { cn } from '@/shared/lib/utils';
import { getLocaleDateFns } from '@/shared/i18n/helper';

export interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  mode?: StudentFormMode;
  initialData?: Student;
  onSuccess?: () => void;
  onStudentCreated?: (student: Student) => void;
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
  onStudentCreated,
}: StudentFormDialogProps) {
  const { t } = useTranslation('classes', { keyPrefix: 'roster' });
  const { t: tValidation } = useTranslation('classes');
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

  const dateOfBirth = watch('dateOfBirth');
  const hasDateOfBirth = dateOfBirth && dateOfBirth.trim();

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
      setValue('fullName', initialData.fullName || '');
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
        onSuccess: (student) => {
          reset();
          onOpenChange(false);
          onSuccess?.();
          onStudentCreated?.(student);
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

  const getErrorMessage = (error: FieldError | undefined): string => {
    if (!error?.message || typeof error.message !== 'string') {
      return '';
    }
    // Error message is a i18n key from Zod schema, translate it
    return tValidation(error.message as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('addStudentButton') : t('editStudent')}</DialogTitle>
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
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('form.optionalInformation')}</h3>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('form.dateOfBirth')}</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !hasDateOfBirth && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {hasDateOfBirth
                      ? format(new Date(dateOfBirth), 'PPPP', { locale: getLocaleDateFns() })
                      : t('form.dateOfBirth')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={hasDateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={(date) => {
                      setValue('dateOfBirth', date ? format(date, 'yyyy-MM-dd') : '');
                    }}
                    disabled={(date: Date) => date > new Date()}
                    locale={getLocaleDateFns()}
                  />
                </PopoverContent>
              </Popover>
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
              {isSubmitting ? t('form.saving') : mode === 'create' ? t('form.submit') : t('form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
