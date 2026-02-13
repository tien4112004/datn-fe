import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCreateAssignment, useUpdateAssignment } from './useAssignmentApi';
import { useAssignmentFormStore } from '../stores/useAssignmentFormStore';
import { useAssignmentEditorStore } from '../stores/useAssignmentEditorStore';
import { useValidateQuestion } from './useValidateQuestion';
import { transformQuestionsForApi } from '../utils/questionTransform';
import { cellsToApiMatrix } from '../utils';
import type { SubjectCode } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core/assessment/grades.js';
import { validateMatrix } from '../utils/matrixHelpers';
import type { AssignmentValidationErrors } from '../types';

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
  const validateQuestion = useValidateQuestion();
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(async () => {
    const data = useAssignmentFormStore.getState();

    // Build validation errors
    const assignmentErrors: AssignmentValidationErrors['assignment'] = {};
    const questionErrors: AssignmentValidationErrors['questions'] = {};

    // Assignment-level validation
    if (!data.title || data.title.trim() === '') {
      assignmentErrors.title = t('validation.titleRequired');
    }
    if (!data.subject) {
      assignmentErrors.subject = t('validation.subjectRequired');
    }

    // Question-level validation
    data.questions.forEach((aq) => {
      const result = validateQuestion(aq.question);
      if (!result.isValid || result.warnings.length > 0) {
        questionErrors[aq.question.id] = {
          errors: result.errors,
          warnings: result.warnings,
        };
      }
    });

    // Matrix validation — check cells with requiredCount > 0 that aren't fulfilled
    let matrixErrors: AssignmentValidationErrors['matrix'];
    const activeCells = data.matrix.filter((c) => c.requiredCount > 0);
    if (activeCells.length > 0) {
      const validationResult = validateMatrix(activeCells);
      const unfulfilled = validationResult.cellsStatus.filter((c) => !c.isFulfilled);
      if (unfulfilled.length > 0) {
        matrixErrors = {
          errors: [t('validation.matrixNotFulfilled', { count: unfulfilled.length })],
        };
      }
    }

    const hasAssignmentErrors = Object.keys(assignmentErrors).length > 0;
    const hasQuestionErrors = Object.values(questionErrors).some((q) => q.errors.length > 0);

    if (hasAssignmentErrors || hasQuestionErrors) {
      // Store errors for UI display (include matrix warnings for indicator)
      data.setValidationErrors({
        assignment: assignmentErrors,
        questions: questionErrors,
        matrix: matrixErrors,
      });

      // Auto-navigate to first error
      if (hasAssignmentErrors) {
        useAssignmentEditorStore.getState().setMainView('info');
      } else {
        const firstErrorQuestionId = data.questions.find(
          (aq) => questionErrors[aq.question.id]?.errors.length > 0
        )?.question.id;
        if (firstErrorQuestionId) {
          useAssignmentEditorStore.getState().setMainView('questions');
          useAssignmentEditorStore.getState().setCurrentQuestionId(firstErrorQuestionId);
        }
      }

      // Show summary toast
      const errorQuestionCount = Object.values(questionErrors).filter((q) => q.errors.length > 0).length;
      if (hasAssignmentErrors && hasQuestionErrors) {
        toast.error(t('validation.multipleErrors', { count: errorQuestionCount }));
      } else if (hasAssignmentErrors) {
        toast.error(t('validation.assignmentFieldsRequired'));
      } else {
        toast.error(t('validation.questionsHaveErrors', { count: errorQuestionCount }));
      }
      return;
    }

    // Matrix errors are non-blocking warnings — store them but proceed with save
    if (matrixErrors) {
      data.setValidationErrors({
        assignment: assignmentErrors,
        questions: questionErrors,
        matrix: matrixErrors,
      });
      toast.warning(matrixErrors.errors[0]);
    }

    // Clear validation errors on successful validation
    data.setValidationErrors(null);

    setIsSaving(true);
    try {
      const apiMatrix = cellsToApiMatrix(
        data.matrix,
        {
          grade: (data.grade || '') as Grade,
          subject: (data.subject || '') as SubjectCode,
        },
        data.topics
      );

      const formData = {
        title: data.title,
        description: data.description,
        subject: data.subject as SubjectCode,
        grade: data.grade as Grade,
        questions: transformQuestionsForApi(data.questions),
        topics: data.topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          description: topic.description,
        })),
        shuffleQuestions: data.shuffleQuestions,
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
  }, [id, createAssignment, updateAssignment, navigate, t, onSaveSuccess, onSaveError, validateQuestion]);

  return { save, isSaving };
}
