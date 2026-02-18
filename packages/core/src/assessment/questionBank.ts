import type { SubjectCode, BankType } from './constants';
import type { Question } from './question';

/**
 * QuestionBankItem combines Question with additional metadata for the bank
 */
export type QuestionBankItem = Question & {
  subject: SubjectCode;
  grade?: string;
  chapter?: string;
  contextId?: string;
  bankType?: BankType;
  createdBy?: string;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Paginated response for question bank listing
 */
export interface QuestionBankListResponse {
  questions: QuestionBankItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request payload for creating a question
 */
export interface CreateQuestionRequest {
  question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Request payload for updating a question
 */
export interface UpdateQuestionRequest {
  question: Partial<QuestionBankItem>;
}

/**
 * Chapter metadata from backend API
 */
export interface ChapterResponse {
  id: string;
  name: string;
  grade: string;
  subject: string;
  sortOrder: string;
}

/**
 * Result of a CSV/bulk import operation
 */
export interface ImportResult {
  success: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
}
