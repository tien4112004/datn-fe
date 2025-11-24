/**
 * Lesson Request Types
 *
 * API request types for lesson-related operations.
 */

import type { LearningObjective, LessonResource, LessonStatus, ObjectiveType, ResourceType } from './lesson';

/**
 * LessonCollectionRequest
 * Query parameters for fetching lessons
 */
export interface LessonCollectionRequest {
  classId?: string;
  subject?: string;
  status?: LessonStatus;
  page?: number;
  pageSize?: number;
}

/**
 * LessonCreateRequest
 * Payload for creating a new lesson
 */
export interface LessonCreateRequest {
  classId: string;
  title: string;
  subject: string;
  description?: string;
  bindedPeriodId?: string;
  objectives: Omit<LearningObjective, 'id' | 'lessonId' | 'createdAt'>[];
  resources: Omit<LessonResource, 'id' | 'lessonId' | 'createdAt'>[];
  notes?: string;
}

/**
 * LessonUpdateRequest
 * Payload for updating an existing lesson
 */
export interface LessonUpdateRequest extends Partial<LessonCreateRequest> {
  id: string;
  status?: LessonStatus;
}

/**
 * LearningObjectiveUpdateRequest
 * Payload for updating a learning objective
 */
export interface LearningObjectiveUpdateRequest {
  id: string;
  description?: string;
  type?: ObjectiveType;
  isAchieved?: boolean;
  notes?: string;
}

/**
 * LessonResourceUpdateRequest
 * Payload for updating a lesson resource
 */
export interface LessonResourceUpdateRequest {
  id: string;
  name?: string;
  type?: ResourceType;
  url?: string;
  filePath?: string;
  description?: string;
  isRequired?: boolean;
  isPrepared?: boolean;
}

/**
 * LessonFilterOptions
 * Client-side filtering options
 */
export interface LessonFilterOptions {
  classId?: string;
  subject?: string;
  status?: LessonStatus;
}

/**
 * LessonSortOption
 * Sorting options for lessons
 */
export type LessonSortOption = 'title-asc' | 'title-desc' | 'status-asc' | 'status-desc';
