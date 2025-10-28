import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Save, FileText, Clock, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {
  LessonPlanCreateRequest,
  LearningObjective,
  LessonResource,
  ObjectiveType,
  ResourceType,
  ClassPeriod,
} from '../../types';

const lessonPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  preparationTime: z.number().min(0).optional(),
  notes: z.string().optional(),
  objectives: z
    .array(
      z.object({
        description: z.string().min(1, 'Objective description is required'),
        type: z.string().min(1, 'Objective type is required'),
        isAchieved: z.boolean().default(false),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one objective is required'),
  resources: z.array(
    z.object({
      name: z.string().min(1, 'Resource name is required'),
      type: z.string().min(1, 'Resource type is required'),
      url: z.string().optional(),
      filePath: z.string().optional(),
      description: z.string().optional(),
      isRequired: z.boolean().default(true),
      isPrepared: z.boolean().default(false),
    })
  ),
});

type LessonPlanFormData = z.infer<typeof lessonPlanSchema>;

interface LessonPlanCreatorProps {
  classId: string;
  teacherId: string;
  period?: ClassPeriod;
  defaultDate?: string;
  defaultSubject?: string;
  onSave: (lessonPlan: LessonPlanCreateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const LessonPlanCreator = ({
  classId,
  teacherId,
  period,
  defaultDate,
  defaultSubject,
  onSave,
  onCancel,
  isLoading = false,
}: LessonPlanCreatorProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lessonPlan.creator' });
  const [estimatedDuration, setEstimatedDuration] = useState(0);

  const form = useForm<LessonPlanFormData>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: defaultSubject || period?.subject || '',
      subjectCode: period?.subjectCode || '',
      date: defaultDate || new Date().toISOString().split('T')[0],
      startTime: period?.startTime || '08:00',
      endTime: period?.endTime || '08:45',
      preparationTime: 15,
      notes: '',
      objectives: [
        {
          description: '',
          type: 'knowledge',
          isAchieved: false,
          notes: '',
        },
      ],
      resources: [],
    },
  });

  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({
    control: form.control,
    name: 'objectives',
  });

  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  const watchedStartTime = form.watch('startTime');
  const watchedEndTime = form.watch('endTime');

  useEffect(() => {
    if (watchedStartTime && watchedEndTime) {
      const start = new Date(`2000-01-01T${watchedStartTime}:00`);
      const end = new Date(`2000-01-01T${watchedEndTime}:00`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      setEstimatedDuration(Math.max(0, duration));
    }
  }, [watchedStartTime, watchedEndTime]);

  const handleSubmit = async (data: LessonPlanFormData) => {
    try {
      await onSave({
        ...data,
        classId,
        teacherId,
        periodId: period?.id,
        objectives: data.objectives.map((obj) => ({
          description: obj.description,
          type: obj.type as ObjectiveType,
          isAchieved: obj.isAchieved,
          notes: obj.notes,
        })),
        resources: data.resources.map((res) => ({
          name: res.name,
          type: res.type as ResourceType,
          url: res.url,
          filePath: res.filePath,
          description: res.description,
          isRequired: res.isRequired,
          isPrepared: res.isPrepared,
        })),
      });
    } catch (error) {
      console.error('Failed to save lesson plan:', error);
    }
  };

  const addObjective = () => {
    appendObjective({
      description: '',
      type: 'knowledge',
      isAchieved: false,
      notes: '',
    });
  };

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

  const objectiveTypes = [
    { value: 'knowledge', label: t('objectiveTypes.knowledge') },
    { value: 'skill', label: t('objectiveTypes.skill') },
    { value: 'attitude', label: t('objectiveTypes.attitude') },
    { value: 'competency', label: t('objectiveTypes.competency') },
  ];

  const resourceTypes = [
    { value: 'presentation', label: t('resourceTypes.presentation') },
    { value: 'mindmap', label: t('resourceTypes.mindmap') },
    { value: 'document', label: t('resourceTypes.document') },
    { value: 'video', label: t('resourceTypes.video') },
    { value: 'audio', label: t('resourceTypes.audio') },
    { value: 'image', label: t('resourceTypes.image') },
    { value: 'worksheet', label: t('resourceTypes.worksheet') },
    { value: 'equipment', label: t('resourceTypes.equipment') },
    { value: 'other', label: t('resourceTypes.other') },
  ];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('sections.basicInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{t('fields.title')}</Label>
              <Input id="title" {...form.register('title')} placeholder={t('placeholders.title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">{t('fields.subject')}</Label>
              <Input
                id="subject"
                {...form.register('subject')}
                placeholder={t('placeholders.subject')}
                disabled={!!period}
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t('fields.date')}</Label>
              <Input id="date" type="date" {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationTime">{t('fields.preparationTime')}</Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                {...form.register('preparationTime', { valueAsNumber: true })}
                placeholder="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">{t('fields.startTime')}</Label>
              <Input id="startTime" type="time" {...form.register('startTime')} disabled={!!period} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">{t('fields.endTime')}</Label>
              <Input id="endTime" type="time" {...form.register('endTime')} disabled={!!period} />
            </div>
          </div>

          {estimatedDuration > 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {t('duration')}: {estimatedDuration} {t('minutes')}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder={t('placeholders.description')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('sections.objectives')}
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addObjective}>
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.addObjective')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {objectiveFields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {t('objective')} {index + 1}
                </h4>
                {objectiveFields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeObjective(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('fields.objectiveDescription')}</Label>
                  <Textarea
                    {...form.register(`objectives.${index}.description`)}
                    placeholder={t('placeholders.objectiveDescription')}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('fields.objectiveType')}</Label>
                  <Select
                    value={form.watch(`objectives.${index}.type`)}
                    onValueChange={(value) => form.setValue(`objectives.${index}.type`, value)}
                  >
                    <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('sections.resources')}
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addResource}>
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.addResource')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resourceFields.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center">
              <p>{t('noResources')}</p>
              <Button type="button" variant="outline" className="mt-2" onClick={addResource}>
                <Plus className="mr-2 h-4 w-4" />
                {t('actions.addFirstResource')}
              </Button>
            </div>
          ) : (
            resourceFields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {t('resource')} {index + 1}
                  </h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeResource(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('fields.resourceName')}</Label>
                    <Input
                      {...form.register(`resources.${index}.name`)}
                      placeholder={t('placeholders.resourceName')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('fields.resourceType')}</Label>
                    <Select
                      value={form.watch(`resources.${index}.type`)}
                      onValueChange={(value) => form.setValue(`resources.${index}.type`, value)}
                    >
                      <SelectTrigger>
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
                    <Label>{t('fields.resourceUrl')}</Label>
                    <Input
                      {...form.register(`resources.${index}.url`)}
                      placeholder={t('placeholders.resourceUrl')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('fields.resourceDescription')}</Label>
                    <Input
                      {...form.register(`resources.${index}.description`)}
                      placeholder={t('placeholders.resourceDescription')}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...form.register(`resources.${index}.isRequired`)} />
                    <span className="text-sm">{t('fields.isRequired')}</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...form.register(`resources.${index}.isPrepared`)} />
                    <span className="text-sm">{t('fields.isPrepared')}</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.notes')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...form.register('notes')} placeholder={t('placeholders.notes')} rows={4} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('actions.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? t('actions.saving') : t('actions.save')}
        </Button>
      </div>
    </form>
  );
};

export default LessonPlanCreator;
