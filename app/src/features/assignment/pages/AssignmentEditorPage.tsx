import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

  // Generate consistent IDs for default topic and matrix cells
  const defaultTopicId = React.useMemo(() => `topic-${Date.now()}`, []);
  const timestamp = React.useMemo(() => Date.now(), []);

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
          id: defaultTopicId,
          name: 'General',
          description: '',
        },
      ],
      questions: [],
      matrixCells: [
        // Initialize matrix cells for default topic
        {
          id: `cell-${timestamp}-1`,
          topicId: defaultTopicId,
          difficulty: DIFFICULTY.KNOWLEDGE,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${timestamp}-2`,
          topicId: defaultTopicId,
          difficulty: DIFFICULTY.COMPREHENSION,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${timestamp}-3`,
          topicId: defaultTopicId,
          difficulty: DIFFICULTY.APPLICATION,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${timestamp}-4`,
          topicId: defaultTopicId,
          difficulty: DIFFICULTY.ADVANCED_APPLICATION,
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
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <div className="p-8">
        <Breadcrumb className="mb-8">
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
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <AssignmentEditorLayout
              onCancel={handleCancel}
              onSave={form.handleSubmit(handleSubmit)}
              isSaving={form.formState.isSubmitting}
            />
          </form>

          {/* Dialogs */}
          <MetadataEditDialog />
          <MatrixEditorDialog />
          <MatrixViewDialog />
        </FormProvider>
      </div>
    </div>
  );
};
