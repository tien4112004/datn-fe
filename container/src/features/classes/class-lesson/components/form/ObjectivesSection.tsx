import { useFormContext, useFieldArray } from 'react-hook-form';
import { Target, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/components/common/ColoredCard';
import type { LessonFormData } from './LessonCreator';

const objectiveTypes = [
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'skill', label: 'Skill' },
  { value: 'attitude', label: 'Attitude' },
  { value: 'competency', label: 'Competency' },
] as const;

export const ObjectivesSection = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.creator' });
  const { control, register, watch, setValue } = useFormContext<LessonFormData>();

  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({
    control,
    name: 'objectives',
  });

  const addObjective = () => {
    appendObjective({
      description: '',
      type: 'knowledge',
      isAchieved: false,
      notes: '',
    });
  };

  const addObjectiveButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={addObjective}
      className="border-2 border-purple-300 bg-white text-purple-600 transition-all hover:scale-105 hover:bg-purple-500 hover:text-white"
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('actions.addObjective')}
    </Button>
  );

  return (
    <ColoredCard colorScheme="purple">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500 p-2 text-white">
              <Target className="h-5 w-5" />
            </div>
            {t('sections.objectives')}
          </div>
        </ColoredCardTitle>
        <div>{addObjectiveButton}</div>
      </ColoredCardHeader>
      <ColoredCardContent>
        {objectiveFields.map((field, index) => (
          <div
            key={field.id}
            className="group space-y-3 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-5 shadow-sm transition-all duration-300 hover:border-purple-400 hover:shadow-md dark:from-purple-950/20 dark:to-pink-950/20"
          >
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-sm text-white">
                  {index + 1}
                </span>
                {t('objective')} {index + 1}
              </h4>
              {objectiveFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeObjective(index)}
                  className="opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">{t('fields.objectiveDescription')}</Label>
                <Textarea
                  {...register(`objectives.${index}.description`)}
                  placeholder={t('placeholders.objectiveDescription')}
                  rows={2}
                  className="border-2 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t('fields.objectiveType')}</Label>
                <Select
                  value={watch(`objectives.${index}.type`)}
                  onValueChange={(value) => setValue(`objectives.${index}.type`, value)}
                >
                  <SelectTrigger className="border-2 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {objectiveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </ColoredCardContent>
    </ColoredCard>
  );
};
