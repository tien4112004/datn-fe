import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCreateAssignment, useUpdateAssignment } from './useAssignmentApi';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';
import { transformQuestionsForApi } from '../utils/questionTransform';
import { cellsToApiMatrix } from '../utils';

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
      const apiMatrix = cellsToApiMatrix(data.matrixCells, {
        grade: data.grade || null,
        subject: data.subject || null,
      });

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
        contexts: data.contexts,
        matrix: apiMatrix,
      };

      let savedId = id;
      if (id) {
        await updateAssignment({ id, data: formData });
        toast.success(t('toasts.updateSuccess'));
      } else {
        const newAssignment = await createAssignment(formData);
        savedId = newAssignment.id;
        toast.success(t('toasts.createSuccess'));
      }

      onSaveSuccess();
      navigate(`/assignment/${savedId}`);
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
