import type { QuestionBankItem } from '@aiprimary/core';
import { toBackendDifficulty, toFrontendDifficulty } from './difficultyMapper';
import { toBackendQuestionType, toFrontendQuestionType } from './questionTypeMapper';

/**
 * Backend question response structure
 * Matches the QuestionResponseDto from the backend API
 */
interface BackendQuestion {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  explanation?: string;
  titleImageUrl?: string;
  grade?: string;
  chapter?: string;
  subject: string;
  data: any;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Converts a frontend QuestionBankItem to backend question format
 * Transforms Vietnamese codes to English enums and restructures data
 *
 * @param frontendQuestion - Question data from frontend
 * @returns Transformed question data for backend API
 */
export function toBackendQuestion(frontendQuestion: Partial<QuestionBankItem>): any {
  const { difficulty, type, subjectCode, bankType, ...rest } = frontendQuestion;

  return {
    ...rest,
    difficulty: difficulty ? toBackendDifficulty(difficulty) : undefined,
    type: type ? toBackendQuestionType(type) : undefined,
    subject: subjectCode || 'T',
    // Type-specific data is already in the 'data' field, just pass it through
    data: frontendQuestion.data,
  };
}

/**
 * Converts a backend question to frontend QuestionBankItem format
 * Transforms English enums to Vietnamese codes and adds bankType
 *
 * @param backendQuestion - Question data from backend API
 * @returns Transformed question data for frontend
 */
export function toFrontendQuestion(backendQuestion: BackendQuestion): QuestionBankItem {
  const { difficulty, type, subject, ownerId, ...rest } = backendQuestion;

  return {
    ...rest,
    difficulty: toFrontendDifficulty(difficulty),
    type: toFrontendQuestionType(type),
    subjectCode: subject,
    bankType: ownerId ? 'personal' : 'public',
    // Type-specific data is already in the 'data' field, just pass it through
    data: backendQuestion.data,
  } as QuestionBankItem;
}
