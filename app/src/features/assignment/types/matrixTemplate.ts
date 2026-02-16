import type { Grade } from '@aiprimary/core/assessment/grades.js';
import type { SubjectCode } from '@aiprimary/core';
import type { ApiMatrix } from './assignment';

/**
 * Matrix template from API
 */
export interface MatrixTemplate {
  id: string;
  ownerId: string;
  name: string;
  subject: SubjectCode;
  grade: Grade;
  createdAt: string;
  updatedAt: string;
  matrix: ApiMatrix;
  totalQuestions: number;
  totalTopics: number;
}

/**
 * Filters for matrix template list requests
 */
export interface MatrixTemplateFilters {
  search?: string;
  subject?: SubjectCode;
  grade?: Grade;
  page?: number;
  pageSize?: number;
}

/**
 * Request for creating a new matrix template
 */
export interface MatrixTemplateCreateRequest {
  name: string;
  subject: SubjectCode;
  grade: Grade;
  matrixData: string; // JSON.stringify(ApiMatrix)
}

/**
 * Request for updating an existing matrix template
 */
export interface MatrixTemplateUpdateRequest {
  name?: string;
  matrixData?: string; // JSON.stringify(ApiMatrix)
}

/**
 * API response for matrix template list
 */
export interface MatrixTemplateApiResponse {
  data: MatrixTemplate[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
