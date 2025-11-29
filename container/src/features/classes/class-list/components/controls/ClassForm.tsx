import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useClassForm, type ClassSchema } from '../../../shared/hooks/useClassForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, BookOpen, Calendar, MapPin } from 'lucide-react';

interface ClassFormProps {
  initialData?: ClassSchema;
  onSubmit: (data: ClassSchema) => Promise<void>;
  isEditMode?: boolean;
}

export const ClassForm = ({ initialData, onSubmit, isEditMode = false }: ClassFormProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'form' });
  const { t: tValidation } = useTranslation('classes', { keyPrefix: 'validation' });
  const { formData, setFormData, errors, validateForm } = useClassForm({ initialData, onSubmit });
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [formData, errors, validateForm]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setIsLoading(true);
    const isValid = await validateForm();
    if (isValid) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('ClassForm submission error:', error);
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } else {
      console.log('Form is invalid. Please check the errors.');
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldError = (fieldName: string) => errors.find((e) => e.path[0] === fieldName)?.message;

  const getErrorMessage = (errorMessage: any) => {
    if (!errorMessage) return '';
    const translated = tValidation(errorMessage as any);
    // If translation returns an object (multiple validation messages), extract first string value
    if (typeof translated === 'object' && translated !== null) {
      const firstKey = Object.keys(translated)[0];
      return (translated as Record<string, string>)[firstKey] || '';
    }
    return translated || '';
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full space-y-6">
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('requiredInformation')}</h3>
        </div>
        <Separator />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t('name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t('namePlaceholder')}
              className={getFieldError('name') ? 'border-destructive' : ''}
            />
            {getFieldError('name') && (
              <p className="text-destructive text-sm font-medium">{getErrorMessage(getFieldError('name'))}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroom" className="text-sm font-medium">
              <MapPin className="mr-1 inline h-3.5 w-3.5" />
              {t('classroom')}
            </Label>
            <Input
              type="text"
              name="classroom"
              id="classroom"
              value={formData.classroom || ''}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t('classroomPlaceholder')}
              className={getFieldError('classroom') ? 'border-destructive' : ''}
            />
            {getFieldError('classroom') && (
              <p className="text-destructive text-sm font-medium">
                {getErrorMessage(getFieldError('classroom'))}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {t('description')}
          </Label>
          <Textarea
            name="description"
            id="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            placeholder={t('descriptionPlaceholder')}
            className={getFieldError('description') ? 'border-destructive' : ''}
          />
          {getFieldError('description') && (
            <p className="text-destructive text-sm font-medium">
              {getErrorMessage(getFieldError('description'))}
            </p>
          )}
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('optionalInformation')}</h3>
        </div>
        <Separator />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium">
              {t('grade')} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              name="grade"
              id="grade"
              value={formData.grade}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t('gradePlaceholder')}
              min="1"
              max="12"
              className={getFieldError('grade') ? 'border-destructive' : ''}
            />
            {getFieldError('grade') && (
              <p className="text-destructive text-sm font-medium">
                {getErrorMessage(getFieldError('grade'))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear" className="text-sm font-medium">
              {t('academicYear')} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              name="academicYear"
              id="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t('academicYearPlaceholder')}
              className={getFieldError('academicYear') ? 'border-destructive' : ''}
            />
            {getFieldError('academicYear') && (
              <p className="text-destructive text-sm font-medium">
                {getErrorMessage(getFieldError('academicYear'))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroom" className="text-sm font-medium">
              <MapPin className="mr-1 inline h-3.5 w-3.5" />
              {t('classroom')}
            </Label>
            <Input
              type="text"
              name="classroom"
              id="classroom"
              value={formData.classroom || ''}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={t('classroomPlaceholder')}
              className={getFieldError('classroom') ? 'border-destructive' : ''}
            />
            {getFieldError('classroom') && (
              <p className="text-destructive text-sm font-medium">
                {getErrorMessage(getFieldError('classroom'))}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? t('save') : t('submit')}
        </Button>
      </div>
    </form>
  );
};
