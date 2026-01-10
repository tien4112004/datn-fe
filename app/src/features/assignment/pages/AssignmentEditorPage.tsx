import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import LoadingButton from '@/shared/components/common/LoadingButton';
import { AssignmentEditorLayout } from '../components/editor/AssignmentEditorLayout';
import { MetadataEditDialog } from '../components/editor/MetadataEditDialog';
import { MatrixEditorDialog } from '../components/editor/MatrixEditorDialog';
import { MatrixViewDialog } from '../components/editor/MatrixViewDialog';
import type { AssignmentFormData } from '../types';
import { DIFFICULTY } from '../types';
import { useCreateAssignment, useUpdateAssignment } from '../hooks/useAssignmentApi';

export const AssignmentEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  // Validation schema
  const assignmentSchema = z.object({
    title: z.string().min(1, t('validation.titleRequired')),
    description: z.string().optional(),
    subject: z.string().min(1, t('validation.subjectRequired')),
    grade: z.string().optional(),
    shuffleQuestions: z.boolean().optional(),
    topics: z.array(
      z.object({
        id: z.string(),
        name: z.string().min(1, t('validation.topicNameRequired')),
        description: z.string().optional(),
      })
    ),
    questions: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        difficulty: z.string(),
        title: z.string().min(1, 'Question title is required'),
        topicId: z.string(),
        explanation: z.string().optional(),
        points: z.number().optional(),
      })
    ),
    matrixCells: z.array(
      z.object({
        id: z.string(),
        topicId: z.string(),
        difficulty: z.string(),
        requiredCount: z.number().min(0),
        currentCount: z.number().min(0),
      })
    ),
  });

  const { mutateAsync: createAssignment } = useCreateAssignment();
  const { mutateAsync: updateAssignment } = useUpdateAssignment();

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: 'Untitled Assignment',
      description: '',
      subject: '',
      grade: '',
      shuffleQuestions: false,
      topics: [
        {
          id: `topic-${Date.now()}`,
          name: 'General',
          description: '',
        },
      ],
      questions: [],
      matrixCells: [
        // Initialize matrix cells for default topic
        {
          id: `cell-${Date.now()}-1`,
          topicId: `topic-${Date.now()}`,
          difficulty: DIFFICULTY.EASY,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${Date.now()}-2`,
          topicId: `topic-${Date.now()}`,
          difficulty: DIFFICULTY.MEDIUM,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${Date.now()}-3`,
          topicId: `topic-${Date.now()}`,
          difficulty: DIFFICULTY.HARD,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${Date.now()}-4`,
          topicId: `topic-${Date.now()}`,
          difficulty: DIFFICULTY.SUPER_HARD,
          requiredCount: 0,
          currentCount: 0,
        },
      ],
    },
  });

  const handleGoBack = () => {
    navigate('/assignments');
  };

  const handleSubmit = async (data: AssignmentFormData) => {
    try {
      if (id) {
        // Update existing assignment
        await updateAssignment({ id, data: data as any });
        toast.success(t('toasts.updateSuccess'));
      } else {
        // Create new assignment
        await createAssignment(data as any);
        toast.success(t('toasts.createSuccess'));
      }
      navigate('/assignments');
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.error(t('toasts.saveError'));
    }
  };

  const handleCancel = () => {
    handleGoBack();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-8 dark:bg-gray-950">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/assignments">{t('breadcrumbs.assignments')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {id ? t('breadcrumbs.editAssignment') : t('breadcrumbs.createAssignment')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col space-y-6">
          <div className="flex-1">
            <AssignmentEditorLayout />
          </div>

          {/* Action bar */}
          <div className="mt-auto flex justify-end gap-3 rounded-xl border-2 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:bg-gray-900/95">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-2 transition-all hover:scale-105 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              {t('actions.cancel')}
            </Button>
            <LoadingButton
              type="submit"
              loading={form.formState.isSubmitting}
              loadingText={t('actions.saving')}
              className="shadow-lg transition-all hover:scale-105"
            >
              <Save className="mr-2 h-4 w-4" />
              {t('actions.save')}
            </LoadingButton>
          </div>
        </form>

        {/* Dialogs */}
        <MetadataEditDialog />
        <MatrixEditorDialog />
        <MatrixViewDialog />
      </FormProvider>
    </div>
  );
};
