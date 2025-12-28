import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
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
import type { AssignmentFormData } from '../types';
import { DIFFICULTY } from '../types';

// Validation schema
const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Topic name is required'),
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

export const AssignmentEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      subject: '',
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
      console.log('Saving assignment:', data);
      toast.success('Assignment saved successfully!');
      navigate('/assignments');
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.error('Failed to save assignment');
    }
  };

  const handleCancel = () => {
    handleGoBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/assignments">Assignments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{id ? 'Edit Assignment' : 'Create Assignment'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{id ? 'Edit Assignment' : 'Create New Assignment'}</h1>
          <p className="text-muted-foreground">Build your assignment with questions and assessment matrix</p>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <AssignmentEditorLayout />

          {/* Sticky action bar */}
          <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-xl border-2 bg-white/95 p-4 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-2 transition-all hover:scale-105 hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={form.formState.isSubmitting}
              loadingText="Saving..."
              className="shadow-lg transition-all hover:scale-105"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Assignment
            </LoadingButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
