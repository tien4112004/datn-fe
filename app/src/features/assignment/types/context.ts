import type { ApiResponse } from '@aiprimary/api';

/**
 * Context (Reading Passage) for contextual questions
 * A context provides shared reading material that questions can reference
 */
export interface Context {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Filters for querying contexts
 */
export interface ContextFilters {
  search?: string;
  subject?: string[];
  grade?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Request type for creating a context
 */
export type ContextCreateRequest = Omit<Context, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Request type for updating a context
 */
export type ContextUpdateRequest = Partial<ContextCreateRequest>;

/**
 * API response for context list
 */
export type ContextApiResponse = ApiResponse<Context[]>;

/**
 * Response structure for context list hook
 */
export interface ContextListResponse {
  contexts: Context[];
  total: number;
  page: number;
  limit: number;
}
