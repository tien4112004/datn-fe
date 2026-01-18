import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { QuestionBankDialog } from '../components/question-bank';
import { DIFFICULTY } from '../types';
import type { Question } from '../types';
import { useCreateAssignment, useUpdateAssignment } from '../hooks/useAssignmentApi';
import { useDirtyFormTracking } from '../hooks/useDirtyFormTracking';
import { useUnsavedChangesBlocker } from '@/shared/hooks';
import { UnsavedChangesDialog } from '@/shared/components/modals/UnsavedChangesDialog';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';
import { useAssignmentEditorStore } from '../stores/useAssignmentEditorStore';

export const AssignmentEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  const { mutateAsync: createAssignment } = useCreateAssignment();
  const { mutateAsync: updateAssignment } = useUpdateAssignment();

  // Get store data and actions
  const isDirty = useAssignmentFormStore((state) => state.isDirty);
  const markClean = useAssignmentFormStore((state) => state.markClean);
  const initialize = useAssignmentFormStore((state) => state.initialize);

  // Get editor UI state
  const isQuestionBankOpen = useAssignmentEditorStore((state) => state.isQuestionBankOpen);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);

  // Track if save was successful to prevent blocking on navigation after save
  const saveSuccessRef = React.useRef(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Generate consistent IDs for default topic and matrix cells
  const defaultTopicId = React.useMemo(() => `topic-${Date.now()}`, []);
  const timestamp = React.useMemo(() => Date.now(), []);

  // Initialize store with default values on mount and cleanup on unmount
  React.useEffect(() => {
    // Initialize store
    initialize({
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
    });

    // Cleanup: Reset store on unmount to prevent stale data
    return () => {
      useAssignmentFormStore.getState().reset();
    };
  }, [defaultTopicId, timestamp, initialize]);

  // Track dirty state with the hook (now reads from store)
  useDirtyFormTracking();

  // Block navigation when there are unsaved changes
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.assignment.dirty-state-changed',
  });

  const handleGoBack = () => {
    navigate('/projects?resource=assignment');
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Get current state from store
      const data = useAssignmentFormStore.getState();
      const formData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        topics: data.topics,
        questions: data.questions,
        matrixCells: data.matrixCells,
        shuffleQuestions: data.shuffleQuestions,
      };

      if (id) {
        // Update existing assignment
        await updateAssignment({ id, data: formData as any });
        toast.success(t('toasts.updateSuccess'));
      } else {
        // Create new assignment
        await createAssignment(formData as any);
        toast.success(t('toasts.createSuccess'));
      }

      // Mark save as successful to prevent blocking on navigation
      saveSuccessRef.current = true;

      // Mark form as clean
      markClean();

      navigate('/projects?resource=assignment');
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.error(t('toasts.saveError'));
      saveSuccessRef.current = false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !saveSuccessRef.current) {
      // Let the blocker handle this - trigger navigation which will show the dialog
      navigate('/projects?resource=assignment');
    } else {
      // No changes or save was successful, navigate directly
      handleGoBack();
    }
  };

  const handleAddQuestionsFromBank = (questions: Question[]) => {
    // Get current state from store
    const { addQuestion, topics } = useAssignmentFormStore.getState();

    // Use the first topic as default, or the default topic
    const defaultTopic = topics[0];
    if (!defaultTopic) {
      toast.error(t('toasts.noTopicError'));
      return;
    }

    // Convert each question and add to assignment
    questions.forEach((question) => {
      const assignmentQuestion = {
        question: {
          ...question,
          topicId: defaultTopic.id,
        },
        points: 1,
      };
      addQuestion(assignmentQuestion);
    });

    toast.success(t('toasts.questionsAdded', { count: questions.length }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <div className="p-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects?resource=assignment">
                {t('breadcrumbs.assignments')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {id ? t('breadcrumbs.editAssignment') : t('breadcrumbs.createAssignment')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <AssignmentEditorLayout onCancel={handleCancel} onSave={handleSubmit} isSaving={isSaving} />

        {/* Dialogs */}
        <MetadataEditDialog />
        <QuestionBankDialog
          open={isQuestionBankOpen}
          onOpenChange={setQuestionBankOpen}
          onAddQuestions={handleAddQuestionsFromBank}
        />

        {/* Unsaved Changes Dialog */}
        <UnsavedChangesDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onStay={handleStay}
          onLeave={handleProceed}
        />
      </div>
    </div>
  );
};
