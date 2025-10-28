import { useForm } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type {
  LessonPlanCreateRequest,
  LessonPlanUpdateRequest,
  LessonPlan,
  ObjectiveType,
  ResourceType,
} from '../../types';
import type { SchedulePeriod } from '../../../class-schedule';

export interface LessonPlanFormData {
  title: string;
  description?: string;
  subject: string; // Now a string code instead of object
  notes?: string;
  objectives: Array<{
    description: string;
    type: string;
    isAchieved: boolean;
    notes?: string;
  }>;
  resources: Array<{
    name: string;
    type: string;
    url?: string;
    filePath?: string;
    description?: string;
    isRequired: boolean;
    isPrepared: boolean;
  }>;
}

import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { BasicInfoSection } from './BasicInfoSection';
import { NotesSection } from './NotesSection';
import { ObjectivesSection } from './ObjectivesSection';
import { ResourcesSection } from './ResourcesSection';

interface LessonPlanCreatorProps {
  classId: string;
  period?: SchedulePeriod;
  defaultSubject?: string;
  lessonId?: string;
  existingData?: LessonPlan;
  operation?: 'create' | 'update';
  onSave: (lessonPlan: LessonPlanCreateRequest) => Promise<void>;
  onUpdate?: (lessonPlan: LessonPlanUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LessonPlanCreator = ({
  classId,
  period,
  defaultSubject,
  lessonId,
  existingData,
  operation = 'create',
  onSave,
  onUpdate,
  onCancel,
  isLoading = false,
}: LessonPlanCreatorProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lessonPlan.creator' });
  const { t: tValidation } = useTranslation('classes', { keyPrefix: 'validation' });

  // Schema with localized validation messages
  const lessonPlanSchema = z.object({
    title: z.string().min(1, tValidation('lessonPlan.titleRequired')),
    description: z.string().optional(),
    subject: z.string().min(1, 'Subject is required'), // Now a string code
    notes: z.string().optional(),
    objectives: z
      .array(
        z.object({
          description: z.string().min(1, tValidation('lessonPlan.objectiveDescriptionRequired')),
          type: z.string().min(1, tValidation('lessonPlan.objectiveTypeRequired')),
          isAchieved: z.boolean(),
          notes: z.string().optional(),
        })
      )
      .min(1, tValidation('lessonPlan.atLeastOneObjective')),
    resources: z.array(
      z.object({
        name: z.string().min(1, tValidation('lessonPlan.resourceNameRequired')),
        type: z.string().min(1, tValidation('lessonPlan.resourceTypeRequired')),
        url: z.string().optional(),
        filePath: z.string().optional(),
        description: z.string().optional(),
        isRequired: z.boolean(),
        isPrepared: z.boolean(),
      })
    ),
  });

  const form = useForm<LessonPlanFormData>({
    resolver: zodResolver(lessonPlanSchema),
    defaultValues:
      operation === 'update' && existingData
        ? {
            title: existingData.title,
            description: existingData.description || '',
            subject: existingData.subject || '', // Now a string code
            notes: existingData.notes || '',
            objectives: existingData.objectives.map((obj) => ({
              description: obj.description,
              type: obj.type,
              isAchieved: obj.isAchieved,
              notes: obj.notes || '',
            })),
            resources: existingData.resources.map((res) => ({
              name: res.name,
              type: res.type,
              url: res.url || '',
              filePath: res.filePath || '',
              description: res.description || '',
              isRequired: res.isRequired,
              isPrepared: res.isPrepared,
            })),
          }
        : {
            title: '',
            description: '',
            subject: defaultSubject || period?.subject || '', // Now a string code
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

  const handleSubmit = async (data: LessonPlanFormData) => {
    try {
      if (operation === 'update' && lessonId && onUpdate) {
        // Update operation
        await onUpdate({
          id: lessonId,
          title: data.title,
          description: data.description,
          notes: data.notes,
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
        toast.success('Lesson plan updated successfully!');
      } else {
        // Create operation
        const subject = data.subject;
        const bindedPeriodId = period?.id;

        await onSave({
          classId,
          subject: subject,
          title: data.title,
          description: data.description,
          notes: data.notes,
          bindedPeriodId,
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
        toast.success('Lesson plan created successfully!');
      }
    } catch (error) {
      console.error('Failed to save lesson plan:', error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <BasicInfoSection isPeriodProvided={!!period} isUpdate={operation === 'update'} />
        <ObjectivesSection />
        <ResourcesSection />
        <NotesSection />

        <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-xl border-2 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-2 transition-all hover:scale-105 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            {t('actions.cancel')}
          </Button>
          <LoadingButton
            type="submit"
            loading={isLoading}
            loadingText={t('actions.saving')}
            className="shadow-lg transition-all hover:scale-105 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
          >
            <Save className="mr-2 h-4 w-4" />
            {t('actions.save')}
          </LoadingButton>
        </div>
      </form>
    </FormProvider>
  );
};
