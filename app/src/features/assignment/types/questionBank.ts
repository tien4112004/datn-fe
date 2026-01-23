import type { QuestionBankItem } from '@aiprimary/core';
import type { ApiResponse } from '@aiprimary/api';
import type { BankType } from '.';

// Re-export core type
export type { QuestionBankItem } from '@aiprimary/core';

/**
 * Filters for querying the question bank
 * UI/API-specific type for filtering question bank lists
 *
 * Field names match backend Spring Boot API expectations
 * All filter fields use arrays for consistency (multi-select support)
 */
export interface QuestionBankFilters {
  /** Search in title (case-insensitive substring match) */
  search?: string;
  /** Filter by question types - array only */
  type?: string[];
  /** Filter by difficulty levels - array only */
  difficulty?: string[];
  /** Filter by subjects - array only */
  subject?: string[];
  /** Filter by grades - array only */
  grade?: string[];
  /** Filter by chapters - array only */
  chapter?: string[];
  /** Filter by personal or application bank (required by backend) */
  bankType: BankType;
  /** Pagination: page number (1-indexed, default: 1) */
  page?: number;
  /** Pagination: items per page (range: 1-100, default: 10) */
  pageSize?: number;
  /** Sort field name (default: "createdAt") */
  sortBy?: string;
  /** Sort direction: "ASC" or "DESC" (default: "DESC") */
  sortDirection?: 'ASC' | 'DESC';
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
/**
 * Response structure for chapter from backend API
 */
export interface ChapterResponse {
  id: string;
  name: string;
  grade: string;
  subject: string;
  sortOrder: string;
}

export interface QuestionBankApiService {
  // Query operations
  getQuestions(filters: QuestionBankFilters): Promise<QuestionBankApiResponse>;
  getQuestionById(id: string): Promise<QuestionBankItem>;

  // CRUD operations
  createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem>;
  createQuestions(
    questions: Array<Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<QuestionBankItem[]>;
  updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem>;
  deleteQuestion(id: string): Promise<void>;
  bulkDeleteQuestions(ids: string[]): Promise<void>;

  // Utility operations
  duplicateQuestion(id: string): Promise<QuestionBankItem>;

  // Import/Export
  exportQuestions(filters?: QuestionBankFilters): Promise<Blob>;
  importQuestions(file: File): Promise<{ success: number; failed: number }>;

  // Metadata
  getChapters(subject: string, grade: string): Promise<ChapterResponse[]>;
}
