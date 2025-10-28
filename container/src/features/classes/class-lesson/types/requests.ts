/**
 * Lesson Plan Request Types
 *
 * API request types for lesson plan-related operations.
 */

import type { LearningObjective, LessonResource, LessonStatus, ObjectiveType, ResourceType } from './lesson';

/**
 * LessonPlanCollectionRequest
 * Query parameters for fetching lesson plans
 */
export interface LessonPlanCollectionRequest {
  classId?: string;
  subject?: string;
  status?: LessonStatus;
  page?: number;
  pageSize?: number;
}

/**
 * LessonPlanCreateRequest
 * Payload for creating a new lesson plan
 */
export interface LessonPlanCreateRequest {
  classId: string;
  title: string;
  subject: string;
  description?: string;
  bindedPeriodId?: string;
  objectives: Omit<LearningObjective, 'id' | 'lessonPlanId' | 'createdAt'>[];
  resources: Omit<LessonResource, 'id' | 'lessonPlanId' | 'createdAt'>[];
  notes?: string;
}

/**
 * LessonPlanUpdateRequest
 * Payload for updating an existing lesson plan
 */
export interface LessonPlanUpdateRequest extends Partial<LessonPlanCreateRequest> {
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
 * Sorting options for lesson plans
 */
export type LessonSortOption = 'title-asc' | 'title-desc' | 'status-asc' | 'status-desc';
