import { useForm } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type {
  LessonCreateRequest,
  LessonUpdateRequest,
  Lesson,
  ObjectiveType,
  ResourceType,
} from '../../types';
import type { SchedulePeriod } from '../../../class-schedule';

export interface LessonFormData {
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

interface LessonCreatorProps {
  classId: string;
  period?: SchedulePeriod;
  defaultSubject?: string;
  lessonId?: string;
  existingData?: Lesson;
  operation?: 'create' | 'update';
  onSave: (lesson: LessonCreateRequest) => Promise<void>;
  onUpdate?: (lesson: LessonUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LessonCreator = ({
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
}: LessonCreatorProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.creator' });
  const { t: tValidation } = useTranslation('classes', { keyPrefix: 'validation' });

  // Schema with localized validation messages
  const lessonSchema = z.object({
    title: z.string().min(1, tValidation('lesson.titleRequired')),
    description: z.string().optional(),
    subject: z.string().min(1, 'Subject is required'), // Now a string code
    notes: z.string().optional(),
    objectives: z
      .array(
        z.object({
          description: z.string().min(1, tValidation('lesson.objectiveDescriptionRequired')),
          type: z.string().min(1, tValidation('lesson.objectiveTypeRequired')),
          isAchieved: z.boolean(),
          notes: z.string().optional(),
        })
      )
      .min(1, tValidation('lesson.atLeastOneObjective')),
    resources: z.array(
      z.object({
        name: z.string().min(1, tValidation('lesson.resourceNameRequired')),
        type: z.string().min(1, tValidation('lesson.resourceTypeRequired')),
        url: z.string().optional(),
        filePath: z.string().optional(),
        description: z.string().optional(),
        isRequired: z.boolean(),
        isPrepared: z.boolean(),
      })
    ),
  });

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
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

  const handleSubmit = async (data: LessonFormData) => {
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
        toast.success(t('updateSuccess'));
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
        toast.success(t('createSuccess'));
      }
    } catch (error) {
      console.error('Failed to save lesson:', error);
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
