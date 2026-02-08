import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCreateAssignment, useUpdateAssignment } from './useAssignmentApi';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';
import { transformQuestionsForApi } from '../utils/questionTransform';

interface UseSaveAssignmentOptions {
  id?: string;
  onSaveSuccess: () => void;
  onSaveError: () => void;
}

/**
 * Encapsulates the entire save flow: validate → transform → mutate → toast → navigate.
 */
export function useSaveAssignment({ id, onSaveSuccess, onSaveError }: UseSaveAssignmentOptions) {
  const navigate = useNavigate();
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });
  const { mutateAsync: createAssignment } = useCreateAssignment();
  const { mutateAsync: updateAssignment } = useUpdateAssignment();
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async () => {
    const data = useAssignmentFormStore.getState();

    // Validate
    if (!data.title || data.title.trim() === '') {
      toast.error(t('validation.titleRequired'));
      return;
    }
    if (!data.subject) {
      toast.error(t('validation.subjectRequired'));
      return;
    }
    const invalidQuestions = data.questions.filter(
      (q) => !q.question.id || !q.question.type || !q.question.title
    );
    if (invalidQuestions.length > 0) {
      toast.error(t('validation.invalidQuestions'));
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
        topics: data.topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          description: topic.description,
        })),
        matrixCells: data.matrixCells
          .filter((cell) => cell.requiredCount > 0)
          .map((cell) => ({
            topicId: cell.topicId,
            difficulty: cell.difficulty,
            requiredCount: cell.requiredCount,
          })),
      };

      if (id) {
        await updateAssignment({ id, data: formData });
        toast.success(t('toasts.updateSuccess'));
      } else {
        await createAssignment(formData);
        toast.success(t('toasts.createSuccess'));
      }

      onSaveSuccess();
      navigate('/projects?resource=assignment');
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.error(t('toasts.saveError'));
      onSaveError();
    } finally {
      setIsSaving(false);
    }
  }, [id, createAssignment, updateAssignment, navigate, t, onSaveSuccess, onSaveError]);

  return { save, isSaving };
}
