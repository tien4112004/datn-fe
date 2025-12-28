import type { QuestionBankItem } from '@aiprimary/core';
import type { QuestionType, Difficulty, SubjectCode, BankType } from './constants';

// Re-export core type
export type { QuestionBankItem } from '@aiprimary/core';

/**
 * Filters for querying the question bank
 * UI/API-specific type for filtering question bank lists
 */
export interface QuestionBankFilters {
  /** Search in title and content */
  searchText?: string;
  /** Filter by question type */
  questionType?: QuestionType;
  /** Filter by difficulty level */
  difficulty?: Difficulty;
  /** Filter by subject */
  subjectCode?: SubjectCode;
  /** Filter by personal or application bank */
  bankType?: BankType;
  /** Pagination: page number (1-indexed) */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
}

/**
 * Response structure for question bank API
 * UI/API-specific type for paginated responses
 */
export interface QuestionBankResponse {
  questions: QuestionBankItem[];
  /** Total matching questions */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
}

/**
 * Request types for question bank operations
 * UI/API-specific types for creating/updating questions
 */
export interface CreateQuestionRequest {
  question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateQuestionRequest {
  question: Partial<QuestionBankItem>;
}

/**
 * API service interface for question bank operations
 * UI/API-specific interface defining the service contract
 */
export interface QuestionBankApiService {
  // Query operations
  getQuestions(filters: QuestionBankFilters): Promise<QuestionBankResponse>;
  getQuestionById(id: string): Promise<QuestionBankItem>;

  // CRUD operations
  createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem>;
  updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem>;
  deleteQuestion(id: string): Promise<void>;
  bulkDeleteQuestions(ids: string[]): Promise<void>;

  // Utility operations
  duplicateQuestion(id: string): Promise<QuestionBankItem>;
  /** Copy from application bank to personal */
  copyToPersonal(id: string): Promise<QuestionBankItem>;

  // Import/Export
  exportQuestions(filters?: QuestionBankFilters): Promise<Blob>;
  importQuestions(file: File): Promise<{ success: number; failed: number }>;
}
