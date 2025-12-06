import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PeriodForm, type PeriodFormRef } from './PeriodForm';
import { useRef, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RepeatRuleForm, type RepeatRuleFormRef } from './RepeatRuleForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SchedulePeriodCreateRequest } from '@/features/classes/shared/types';
import { useAddPeriod } from '../../hooks';

interface AddPeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  selectedDate: string;
}

export const AddPeriodDialog = ({ open, onOpenChange, classId, selectedDate }: AddPeriodDialogProps) => {
  const addEventMutation = useAddPeriod();
  const { t } = useTranslation('classes');
  const periodFormRef = useRef<PeriodFormRef>(null);
  const repeatRuleFormRef = useRef<RepeatRuleFormRef>(null);
  const [isRepeating, setRepeating] = useState(false);

  const handleSave = useCallback(() => {
    if (!periodFormRef.current?.validate()) {
      return;
    }

    if (isRepeating && !repeatRuleFormRef.current?.validate()) {
      return;
    }

    const periodData = periodFormRef.current?.getData();
    if (!periodData) {
      return;
    }

    const payload: SchedulePeriodCreateRequest = {
      classId,
      date: selectedDate,
      startTime: periodData.startTime,
      endTime: periodData.endTime,
      location: periodData.location,
    };
    if (isRepeating) {
      const repeatData = repeatRuleFormRef.current?.getData();
      if (!repeatData) {
        return;
      }
      payload.repeat = repeatData;
    }

    addEventMutation.mutate(
      { classId, data: payload },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }, [isRepeating, selectedDate, classId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            {t('addPeriod.dialog.title')}
          </DialogTitle>
        </DialogHeader>

        {addEventMutation.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {addEventMutation.error.message || 'An unexpected error occurred.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {t('addPeriod.dialog.periodType')}
            </h3>
            <RadioGroup defaultValue="single" onValueChange={(value) => setRepeating(value === 'repeating')}>
              <div className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('addPeriod.dialog.singlePeriod')}</div>
                  <div className="text-muted-foreground text-sm">
                    {t('addPeriod.dialog.singlePeriodDescription')}
                  </div>
                </Label>
              </div>
              <div className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors">
                <RadioGroupItem value="repeating" id="repeating" />
                <Label htmlFor="repeating" className="flex-1 cursor-pointer">
                  <div className="font-medium">{t('addPeriod.dialog.repeatPeriods')}</div>
                  <div className="text-muted-foreground text-sm">
                    {t('addPeriod.dialog.repeatPeriodsDescription')}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {t('addPeriod.dialog.periodDetails')}
            </h3>
            <PeriodForm ref={periodFormRef} selectedDate={selectedDate} />
          </div>

          {isRepeating && (
            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                {t('addPeriod.dialog.repeatSettings')}
              </h3>
              <RepeatRuleForm ref={repeatRuleFormRef} />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 border-t pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {t('addPeriod.dialog.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={addEventMutation.isPending} className="flex-1">
            {addEventMutation.isPending ? t('addPeriod.dialog.saving') : t('addPeriod.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
