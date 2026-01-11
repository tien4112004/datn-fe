import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Wand2, Database } from 'lucide-react';
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
import { AddQuestionButton } from '../components/editor/AddQuestionButton';
import { useAssignmentEditorStore } from '../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../types';
import { DIFFICULTY } from '../types';
import { useCreateAssignment, useUpdateAssignment } from '../hooks/useAssignmentApi';

export const AssignmentEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });
  const { t: tToolbar } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);

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
          difficulty: DIFFICULTY.EASY,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${timestamp}-2`,
          topicId: defaultTopicId,
          difficulty: DIFFICULTY.MEDIUM,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${timestamp}-3`,
          topicId: defaultTopicId,
          difficulty: DIFFICULTY.HARD,
          requiredCount: 0,
          currentCount: 0,
        },
        {
          id: `cell-${timestamp}-4`,
          topicId: defaultTopicId,
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
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <div className="p-8 pb-32">
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
            <AssignmentEditorLayout />
          </form>

          {/* Dialogs */}
          <MetadataEditDialog />
          <MatrixEditorDialog />
          <MatrixViewDialog />

          {/* Fixed Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 shadow-lg backdrop-blur-sm dark:bg-gray-950/95">
            <div className="container mx-auto flex items-center justify-between gap-3 px-8 py-4">
              <div className="flex items-center gap-2">
                <AddQuestionButton />
                <Button type="button" size="sm" variant="outline" disabled>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {tToolbar('generate')}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setQuestionBankOpen(true)}>
                  <Database className="mr-2 h-4 w-4" />
                  {tToolbar('fromBank')}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  {t('actions.cancel')}
                </Button>
                <LoadingButton
                  onClick={form.handleSubmit(handleSubmit)}
                  loading={form.formState.isSubmitting}
                  loadingText={t('actions.saving')}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t('actions.save')}
                </LoadingButton>
              </div>
            </div>
          </div>
        </FormProvider>
      </div>
    </div>
  );
};
