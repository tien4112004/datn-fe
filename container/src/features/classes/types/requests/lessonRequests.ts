/**
 * Lesson Plan Request Types
 *
 * API request types for lesson plan-related operations.
 */

import type {
  LearningObjective,
  LessonResource,
  LessonStatus,
  ObjectiveType,
  ResourceType,
} from '../entities/lesson';

/**
 * LessonPlanCollectionRequest
 * Query parameters for fetching lesson plans
 */
export interface LessonPlanCollectionRequest {
  classId?: string;
  teacherId?: string;
  subject?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
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
  subject: string;
  subjectCode: string;
  title: string;
  description?: string;
  date: string;
  periodId?: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  objectives: Omit<LearningObjective, 'id' | 'lessonPlanId' | 'createdAt'>[];
  resources: Omit<LessonResource, 'id' | 'lessonPlanId' | 'createdAt'>[];
  notes?: string;
  preparationTime?: number;
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
  teacherId?: string;
  subject?: string;
  status?: LessonStatus;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * LessonSortOption
 * Sorting options for lesson plans
 */
export type LessonSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'title-asc'
  | 'title-desc'
  | 'status-asc'
  | 'status-desc';
