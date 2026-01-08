import type { QuestionType, Difficulty, SubjectCode, BankType } from './constants';
import type { Question } from './question';

// Re-export types for convenience
export type { SubjectCode, BankType };

/**
 * QuestionBankItem combines Question with additional metadata for the bank
 * Uses intersection type to include all type-specific fields
 */
export type QuestionBankItem = Question & {
  subjectCode: SubjectCode;
  bankType: BankType; // Personal (teacher's own) or Application (school-wide)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string; // User ID of creator
};

/**
 * Filters for querying the question bank
 */
export interface QuestionBankFilters {
  searchText?: string; // Search in title and content
  questionType?: QuestionType | QuestionType[]; // Filter by question type (supports multi-select)
  difficulty?: Difficulty | Difficulty[]; // Filter by difficulty level (supports multi-select)
  subjectCode?: SubjectCode | SubjectCode[] | string | string[]; // Filter by subject (supports multi-select, both predefined and custom from API)
  grade?: string | string[]; // Filter by grade (supports multi-select)
  chapter?: string | string[]; // Filter by chapter (supports multi-select)
  bankType?: BankType; // Filter by personal or application bank
  page?: number; // Pagination: page number (1-indexed)
  limit?: number; // Pagination: items per page
}

/**
 * Response structure for question bank API
 */
export interface QuestionBankResponse {
  questions: QuestionBankItem[];
  total: number; // Total matching questions
  page: number; // Current page
  limit: number; // Items per page
}

/**
 * Request types for question bank operations
 */
export interface CreateQuestionRequest {
  question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateQuestionRequest {
  question: Partial<QuestionBankItem>;
}

/**
 * API service interface for question bank operations
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
  copyToPersonal(id: string): Promise<QuestionBankItem>; // Copy from application bank to personal

  // Import/Export
  exportQuestions(filters?: QuestionBankFilters): Promise<Blob>;
  importQuestions(file: File): Promise<{ success: number; failed: number }>;
}
