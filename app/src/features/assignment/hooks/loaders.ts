import { CriticalError } from '@aiprimary/api';
import { ERROR_TYPE } from '@/shared/constants';
import { getQuestionBankApiService } from '../api/questionBank.index';
import { getAssignmentApiService } from '../api';
import type { QuestionBankItem } from '../types/questionBank';
import type { Assignment } from '@aiprimary/core';

export const getQuestionById = async ({ params }: { params: { id?: string } }) => {
  if (!params.id) {
    throw new CriticalError('Question ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const apiService = getQuestionBankApiService();
  const question = await apiService.getQuestionById(params.id);

  // Basic sanity checks
  if (question && question.id !== params.id) {
    throw new CriticalError(
      `Question ID mismatch: expected ${params.id}, got ${question.id}`,
      ERROR_TYPE.VALIDATION
    );
  }

  return { question: question || null } as { question: QuestionBankItem | null };
};

export const getAssignmentById = async ({ params }: { params: { id?: string } }) => {
  if (!params.id) {
    throw new CriticalError('Assignment ID is required', ERROR_TYPE.RESOURCE_NOT_FOUND);
  }

  const apiService = getAssignmentApiService();
  const assignment = await apiService.getAssignmentById(params.id);

  // Basic sanity checks
  if (assignment && assignment.id !== params.id) {
    throw new CriticalError(
      `Assignment ID mismatch: expected ${params.id}, got ${assignment.id}`,
      ERROR_TYPE.VALIDATION
    );
  }

  return { assignment: assignment || null } as { assignment: Assignment | null };
};
