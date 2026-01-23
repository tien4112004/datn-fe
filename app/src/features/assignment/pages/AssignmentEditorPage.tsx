import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AssignmentEditorLayout } from '../components/editor/AssignmentEditorLayout';
import { MetadataEditDialog } from '../components/editor/MetadataEditDialog';
import { QuestionBankDialog } from '../components/question-bank';
import { DIFFICULTY } from '../types';
import type { Question, AssignmentQuestionWithTopic, QuestionItemRequest } from '../types';
import { useCreateAssignment, useUpdateAssignment, useAssignment } from '../hooks/useAssignmentApi';
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

  // Fetch assignment detail when editing
  const { data: assignmentData, isLoading: isLoadingAssignment } = useAssignment(id ?? '');

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

  // Backend question format (flat structure with point)
  interface BackendQuestion {
    id: string;
    type: string;
    difficulty: string;
    title: string;
    titleImageUrl?: string;
    explanation?: string;
    grade?: string;
    chapter?: string;
    subject?: string;
    data: unknown;
    point: number;
  }

  // Transform backend questions (flat format) to frontend format (nested)
  const transformQuestionsFromApi = React.useCallback(
    (questions: BackendQuestion[]): AssignmentQuestionWithTopic[] => {
      return questions.map((q) => {
        // Construct the question object with all required fields
        const question = {
          id: q.id,
          type: q.type,
          difficulty: q.difficulty,
          title: q.title,
          titleImageUrl: q.titleImageUrl,
          explanation: q.explanation,
          data: q.data,
          topicId: defaultTopicId, // Assign to default topic
        } as AssignmentQuestionWithTopic['question'];

        return {
          question,
          points: q.point,
        };
      });
    },
    [defaultTopicId]
  );

  // Initialize store with default values or fetched data
  React.useEffect(() => {
    // Skip initialization while loading in edit mode
    if (id && isLoadingAssignment) {
      return;
    }

    if (id && assignmentData) {
      // Edit mode: Initialize with fetched assignment data
      // Cast to access backend fields that may not be in core type
      const assignment = assignmentData as typeof assignmentData & {
        subject?: string;
        grade?: string;
      };
      // Cast questions to backend format (flat structure with point)
      const backendQuestions = (assignment.questions || []) as unknown as BackendQuestion[];
      const transformedQuestions = transformQuestionsFromApi(backendQuestions);

      initialize({
        title: assignment.title || 'Untitled Assignment',
        description: assignment.description || '',
        subject: assignment.subject || '',
        grade: assignment.grade || '',
        shuffleQuestions: assignment.shuffleQuestions || false,
        topics: [
          {
            id: defaultTopicId,
            name: 'General',
            description: '',
          },
        ],
        questions: transformedQuestions,
        matrixCells: [
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

      // Mark form as clean after loading existing data
      markClean();
    } else if (!id) {
      // Create mode: Initialize with default values
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
    }

    // Cleanup: Reset store on unmount to prevent stale data
    return () => {
      useAssignmentFormStore.getState().reset();
    };
  }, [
    id,
    assignmentData,
    isLoadingAssignment,
    defaultTopicId,
    timestamp,
    initialize,
    markClean,
    transformQuestionsFromApi,
  ]);

  // Track dirty state with the hook (now reads from store)
  useDirtyFormTracking();

  // Block navigation when there are unsaved changes
  const { showDialog, setShowDialog, handleStay, handleProceed } = useUnsavedChangesBlocker({
    eventName: 'app.assignment.dirty-state-changed',
    skipBlockingRef: saveSuccessRef,
  });

  const handleGoBack = () => {
    navigate('/projects?resource=assignment');
  };

  // Transform questions from frontend format to backend format
  const transformQuestionsForApi = (questions: AssignmentQuestionWithTopic[]): QuestionItemRequest[] => {
    return questions.map(({ question, points }) => {
      // Cast to access backend-specific fields that may not be in core type
      const q = question as typeof question & {
        grade?: string;
        chapter?: string;
        subject?: string;
      };
      return {
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        title: q.title,
        titleImageUrl: q.titleImageUrl,
        explanation: q.explanation,
        grade: q.grade,
        chapter: q.chapter,
        subject: q.subject,
        // Include type inside data for Jackson polymorphic deserialization
        data: q.data ? { type: q.type, ...q.data } : null,
        point: points,
      };
    });
  };

  // Validate form data before submission
  const validateForm = (data: ReturnType<typeof useAssignmentFormStore.getState>): string | null => {
    // Check title
    if (!data.title || data.title.trim() === '') {
      return t('validation.titleRequired');
    }

    // Check subject
    if (!data.subject) {
      return t('validation.subjectRequired');
    }

    // Validate questions have required fields
    const invalidQuestions = data.questions.filter(
      (q) => !q.question.id || !q.question.type || !q.question.title
    );
    if (invalidQuestions.length > 0) {
      return t('validation.invalidQuestions');
    }

    return null;
  };

  const handleSubmit = async () => {
    // Get current state from store
    const data = useAssignmentFormStore.getState();

    // Validate form
    const validationError = validateForm(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const formData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        questions: transformQuestionsForApi(data.questions),
        // Include topics
        topics: data.topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          description: topic.description,
        })),
        // Include matrix cells (only those with requiredCount > 0)
        matrixCells: data.matrixCells
          .filter((cell) => cell.requiredCount > 0)
          .map((cell) => ({
            topicId: cell.topicId,
            difficulty: cell.difficulty,
            requiredCount: cell.requiredCount,
          })),
      };

      if (id) {
        // Update existing assignment
        await updateAssignment({ id, data: formData });
        toast.success(t('toasts.updateSuccess'));
      } else {
        // Create new assignment
        await createAssignment(formData);
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

  // Show loading indicator while fetching assignment in edit mode
  if (id && isLoadingAssignment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <p className="mt-4 text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <div className="p-8">
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
