import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { z } from 'zod';

// Zod validation schema for repeat rule form
const repeatRuleFormSchema = z
  .object({
    repeatType: z.enum(['daily', 'weekly']),
    weekdays: z.array(z.number()).optional(),
    endDate: z.date(),
  })
  .refine(
    (data) => {
      // If repeat type is weekly, weekdays must not be empty
      if (data.repeatType === 'weekly') {
        return data.weekdays && data.weekdays.length > 0;
      }
      return true;
    },
    {
      message: 'At least one weekday must be selected for weekly repetition',
      path: ['weekdays'],
    }
  );

interface RepeatRuleFormProps {}

export interface RepeatRuleFormData {
  repeatType: 'daily' | 'weekly';
  weekdays?: number[];
  endDate: Date;
}

export interface RepeatRuleFormRef {
  validate: () => boolean;
  getData: () => RepeatRuleFormData | null;
}

export const RepeatRuleForm = forwardRef<RepeatRuleFormRef, RepeatRuleFormProps>((_, ref) => {
  const [repeatType, setRepeatType] = useState('daily');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation('classes');

  useImperativeHandle(ref, () => ({
    validate: validate,
    getData: getData,
  }));

  useEffect(() => {
    // Form state is managed internally, no need to call onChange
  }, [repeatType, endDate, weekdays]);

  // Validation function
  const validate = useCallback(() => {
    const formData = { repeatType, weekdays: weekdays.length > 0 ? weekdays : undefined, endDate };
    const result = repeatRuleFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((error: any) => {
        if (error.path.length > 0) {
          const field = error.path[0] as string;
          switch (field) {
            case 'weekdays':
              errors[field] = t('addPeriod.repeatRuleForm.selectAtLeastOneDay');
              break;
            case 'endDate':
              errors[field] = t('addPeriod.repeatRuleForm.selectEndDateRequired');
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
  }, [repeatType, weekdays, endDate, t]);

  const getData = useCallback((): RepeatRuleFormData | null => {
    if (!validate()) {
      return null;
    }

    return {
      repeatType: repeatType as 'daily' | 'weekly',
      weekdays: weekdays.length > 0 ? weekdays : undefined,
      endDate: endDate!,
    };
  }, [validate, repeatType, weekdays, endDate]);

  const handleWeekdayChange = useCallback(
    (day: number, checked: boolean) => {
      if (checked) {
        setWeekdays([...weekdays, day]);
      } else {
        setWeekdays(weekdays.filter((d) => d !== day));
      }
      // Clear weekdays validation error when user makes a selection
      if (validationErrors.weekdays) {
        setValidationErrors((prev) => {
          const { weekdays, ...rest } = prev;
          return rest;
        });
      }
    },
    [weekdays, validationErrors.weekdays]
  );

  const getWeekdayLabel = useCallback((day: number) => {
    // Create a date for the given weekday (0 = Sunday, 1 = Monday, etc.)
    const date = new Date(2023, 0, day + 1); // January 1, 2023 was a Sunday, so Jan 1+day gives us the right weekday
    return format(date, 'EEE', { locale: getLocaleDateFns() });
  }, []);

  const getWeekdayFull = useCallback((day: number) => {
    // Create a date for the given weekday (0 = Sunday, 1 = Monday, etc.)
    const date = new Date(2023, 0, day + 1); // January 1, 2023 was a Sunday, so Jan 1+day gives us the right weekday
    return format(date, 'EEEE', { locale: getLocaleDateFns() });
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('addPeriod.repeatRuleForm.repeatFrequency')}</Label>
        <RadioGroup defaultValue="daily" onValueChange={setRepeatType}>
          <div className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('addPeriod.repeatRuleForm.daily')}</div>
              <div className="text-muted-foreground text-sm">
                {t('addPeriod.repeatRuleForm.dailyDescription')}
              </div>
            </Label>
          </div>
          <div className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors">
            <RadioGroupItem value="weekly" id="weekly" />
            <Label htmlFor="weekly" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('addPeriod.repeatRuleForm.weekly')}</div>
              <div className="text-muted-foreground text-sm">
                {t('addPeriod.repeatRuleForm.weeklyDescription')}
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {repeatType === 'weekly' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('addPeriod.repeatRuleForm.selectDays')}</Label>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <div key={day} className="flex flex-col items-center space-y-1">
                <Checkbox
                  id={`day-${day}`}
                  checked={weekdays.includes(day)}
                  onCheckedChange={(checked) => handleWeekdayChange(day, !!checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`day-${day}`}
                  className="hover:text-primary cursor-pointer text-xs font-medium transition-colors"
                  title={getWeekdayFull(day)}
                >
                  {getWeekdayLabel(day)}
                </Label>
              </div>
            ))}
          </div>
          {weekdays.length === 0 && <p className="text-destructive text-xs">{validationErrors.weekdays}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="end-date" className="text-sm font-medium">
          {t('addPeriod.repeatRuleForm.endDate')}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-11 w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-3 h-4 w-4" />
              {endDate ? (
                <span className="text-foreground">{format(endDate, 'EEEE, MMMM do, yyyy')}</span>
              ) : (
                <span className="text-muted-foreground">{t('addPeriod.repeatRuleForm.pickEndDate')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        <p className="text-muted-foreground text-xs">{t('addPeriod.repeatRuleForm.pickEndDate')}</p>
      </div>
    </div>
  );
});
