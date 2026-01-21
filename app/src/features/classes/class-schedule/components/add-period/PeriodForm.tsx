import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

// Zod validation schema for period form
const periodFormSchema = z.object({
  periodTemplateId: z.string().min(1),
  location: z.string().max(100).optional().or(z.literal('')),
});

// Mock data for period templates
// TODO: Replace with actual data fetching
const periodTemplates = [
  { id: '1', name: 'Period 1 (08:00 - 09:00)', startTime: '08:00', endTime: '09:00' },
  { id: '2', name: 'Period 2 (09:00 - 10:00)', startTime: '09:00', endTime: '10:00' },
  { id: '3', name: 'Period 3 (10:00 - 11:00)', startTime: '10:00', endTime: '11:00' },
  { id: '4', name: 'Period 4 (11:00 - 12:00)', startTime: '11:00', endTime: '12:00' },
];

interface PeriodFormProps {
  selectedDate: string;
}

interface PeriodFormData {
  periodTemplateId: string;
  subject: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface PeriodFormRef {
  validate: () => boolean;
  getData: () => PeriodFormData | null;
}

export const PeriodForm = forwardRef<PeriodFormRef, PeriodFormProps>(({ selectedDate }, ref) => {
  const [periodTemplateId, setPeriodTemplateId] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation('classes');

  useImperativeHandle(ref, () => ({
    validate: validate,
    getData: getData,
  }));

  const validate = useCallback(() => {
    const formData = { periodTemplateId, location };
    const result = periodFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((error: any) => {
        if (error.path.length > 0) {
          const field = error.path[0] as string;
          switch (field) {
            case 'periodTemplateId':
              errors[field] = t('addPeriod.periodForm.validation.periodTemplateRequired');
              break;
            case 'location':
              errors[field] = t('addPeriod.periodForm.validation.locationTooLong');
              break;
            default:
              errors[field] = error.message;
          }
        }
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  }, [periodTemplateId, location, t]);

  const getData = useCallback((): PeriodFormData | null => {
    if (!validate()) {
      return null;
    }

    if (periodTemplateId) {
      const selectedTemplate = periodTemplates.find((t) => t.id === periodTemplateId);

      if (selectedTemplate) {
        return {
          periodTemplateId,
          subject: '', // No subject selection
          startTime: selectedTemplate.startTime,
          endTime: selectedTemplate.endTime,
          location: location || undefined,
        };
      }
    }

    return null;
  }, [validate, periodTemplateId, location]);

  const handlePeriodChange = useCallback(
    (value: string) => {
      setPeriodTemplateId(value);
      // Clear period template validation error when user makes a selection
      if (validationErrors.periodTemplateId) {
        setValidationErrors((prev) => {
          const { periodTemplateId, ...rest } = prev;
          return rest;
        });
      }
    },
    [validationErrors.periodTemplateId]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocation(value);
      // Clear location validation error when user types
      if (validationErrors.location) {
        setValidationErrors((prev) => {
          const { location, ...rest } = prev;
          return rest;
        });
      }
    },
    [validationErrors.location]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="period-template" className="text-sm font-medium">
          {t('addPeriod.periodForm.periodTemplate')}
        </Label>
        <Select onValueChange={handlePeriodChange}>
          <SelectTrigger
            id="period-template"
            className={`h-11 ${validationErrors.periodTemplateId ? 'border-destructive' : ''}`}
          >
            <SelectValue placeholder={t('addPeriod.periodForm.selectTemplate')} />
          </SelectTrigger>
          <SelectContent>
            {periodTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id} className="py-2">
                <div className="flex gap-4">
                  <span className="font-medium">{template.name.split(' (')[0]}</span>
                  <span className="text-muted-foreground text-sm">
                    {template.name.split(' (')[1]?.replace(')', '')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.periodTemplateId && (
          <p className="text-destructive text-xs">{validationErrors.periodTemplateId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          {t('addPeriod.periodForm.location')}{' '}
          <span className="text-muted-foreground">{t('addPeriod.periodForm.locationOptional')}</span>
        </Label>
        <Input
          id="location"
          placeholder={t('addPeriod.periodForm.locationPlaceholder')}
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className={`h-11 ${validationErrors.location ? 'border-destructive' : ''}`}
        />
        {validationErrors.location && <p className="text-destructive text-xs">{validationErrors.location}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium">
          {t('addPeriod.periodForm.selectedDate')}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-muted/50 h-11 w-full cursor-not-allowed justify-start text-left font-normal"
              disabled
            >
              <CalendarIcon className="text-muted-foreground mr-3 h-4 w-4" />
              <span className="text-muted-foreground">
                {selectedDate
                  ? format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')
                  : t('addPeriod.periodForm.noDateSelected')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={new Date(selectedDate)} disabled />
          </PopoverContent>
        </Popover>
        <p className="text-muted-foreground text-xs">{t('addPeriod.periodForm.datePreselected')}</p>
      </div>
    </div>
  );
});
