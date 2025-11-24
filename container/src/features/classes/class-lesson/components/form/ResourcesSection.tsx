import { useFormContext, useFieldArray } from 'react-hook-form';
import { FileText, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/components/common/ColoredCard';
import type { LessonFormData } from './LessonCreator';

export const resourceTypes = [
  { value: 'presentation', label: 'Presentation' },
  { value: 'mindmap', label: 'Mind Map' },
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'other', label: 'Other' },
] as const;

export const ResourcesSection = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.creator' });
  const { control, register, watch, setValue } = useFormContext<LessonFormData>();

  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control,
    name: 'resources',
  });

  const addResource = () => {
    appendResource({
      name: '',
      type: 'document',
      url: '',
      filePath: '',
      description: '',
      isRequired: true,
      isPrepared: false,
    });
  };

  const addResourceButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={addResource}
      className="border-2 border-green-300 bg-white text-green-600 transition-all hover:scale-105 hover:bg-green-500 hover:text-white"
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('actions.addResource')}
    </Button>
  );

  return (
    <ColoredCard colorScheme="green">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500 p-2 text-white">
              <FileText className="h-5 w-5" />
            </div>
            {t('sections.resources')}
          </div>
        </ColoredCardTitle>
        <div>{addResourceButton}</div>
      </ColoredCardHeader>
      <ColoredCardContent>
        {resourceFields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 p-12 text-center dark:bg-green-950/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <FileText className="h-8 w-8 text-green-500" />
            </div>
            <p className="mb-4 text-lg font-medium text-green-900 dark:text-green-100">{t('noResources')}</p>
            <Button
              type="button"
              variant="outline"
              onClick={addResource}
              className="border-2 border-green-400 bg-white text-green-600 transition-all hover:scale-105 hover:bg-green-500 hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.addFirstResource')}
            </Button>
          </div>
        ) : (
          resourceFields.map((field, index) => (
            <div
              key={field.id}
              className="group space-y-3 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 p-5 shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-md dark:from-green-950/20 dark:to-emerald-950/20"
            >
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                    {index + 1}
                  </span>
                  {t('resource')} {index + 1}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(index)}
                  className="opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('fields.resourceName')}</Label>
                  <Input
                    {...register(`resources.${index}.name`)}
                    placeholder={t('placeholders.resourceName')}
                    className="border-2 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('fields.resourceType')}</Label>
                  <Select
                    value={watch(`resources.${index}.type`)}
                    onValueChange={(value) => setValue(`resources.${index}.type`, value)}
                  >
                    <SelectTrigger className="border-2 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('fields.resourceUrl')}</Label>
                  <Input
                    {...register(`resources.${index}.url`)}
                    placeholder={t('placeholders.resourceUrl')}
                    className="border-2 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t('fields.resourceDescription')}</Label>
                  <Input
                    {...register(`resources.${index}.description`)}
                    placeholder={t('placeholders.resourceDescription')}
                    className="border-2 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="border-1 flex items-center space-x-2 rounded-lg border-green-200 bg-white px-4 py-2 transition-all hover:border-green-400 hover:bg-green-50 dark:bg-green-950/30">
                  <Checkbox
                    checked={watch(`resources.${index}.isRequired`)}
                    onCheckedChange={(checked) =>
                      setValue(`resources.${index}.isRequired`, checked as boolean)
                    }
                    className="text-green-600"
                  />
                  <span className="text-sm font-medium">{t('fields.isRequired')}</span>
                </div>

                <div className="border-1 flex items-center space-x-2 rounded-lg border-green-200 bg-white px-4 py-2 transition-all hover:border-green-400 hover:bg-green-50 dark:bg-green-950/30">
                  <Checkbox
                    checked={watch(`resources.${index}.isPrepared`)}
                    onCheckedChange={(checked) =>
                      setValue(`resources.${index}.isPrepared`, checked as boolean)
                    }
                    className="text-green-600"
                  />
                  <span className="text-sm font-medium">{t('fields.isPrepared')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </ColoredCardContent>
    </ColoredCard>
  );
};
