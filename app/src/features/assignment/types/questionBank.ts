import type { QuestionBankItem } from '@aiprimary/core';
import type { ApiResponse } from '@aiprimary/api';
import type { QuestionType, Difficulty, SubjectCode, BankType } from '.';

// Re-export core type
export type { QuestionBankItem } from '@aiprimary/core';

/**
 * Filters for querying the question bank
 * UI/API-specific type for filtering question bank lists
 */
export interface QuestionBankFilters {
  /** Search in title and content */
  searchText?: string;
  /** Filter by question type (supports multi-select) */
  questionType?: QuestionType | QuestionType[];
  /** Filter by difficulty level (supports multi-select) */
  difficulty?: Difficulty | Difficulty[];
  /** Filter by subject (supports multi-select, both predefined and custom from API) */
  subject?: SubjectCode | SubjectCode[] | string | string[];
  /** Filter by grade (supports multi-select) */
  grade?: string | string[];
  /** Filter by chapter (supports multi-select) */
  chapter?: string | string[];
  /** Filter by personal or application bank */
  bankType?: BankType;
  /** Pagination: page number (1-indexed) */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
}

/**
 * Response structure for question bank API service
 * Uses standard ApiResponse with QuestionBankItem array
 */
export type QuestionBankApiResponse = ApiResponse<QuestionBankItem[]>;

/**
 * Response structure returned by useQuestionBankList hook
 * Transforms ApiResponse into a flattened structure for easier use
 */
export interface QuestionBankListResponse {
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
  getQuestions(filters: QuestionBankFilters): Promise<QuestionBankApiResponse>;
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

  // Metadata
  getSubjects(): Promise<string[]>;
  getGrades(): Promise<string[]>;
  getChapters(subject: string, grade: string): Promise<string[]>;
}
