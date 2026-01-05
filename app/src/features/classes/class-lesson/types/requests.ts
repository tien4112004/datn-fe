/**
 * Lesson Request Types
 *
 * API request types for lesson-related operations.
 */

import type { LessonStatus, ObjectiveType, ResourceType } from './lesson';

/**
 * LessonCollectionRequest
 * Query parameters for fetching lessons
 */
export interface LessonCollectionRequest {
  classId?: string;
  subject?: string;
  status?: LessonStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * LessonCreateRequest
 * Payload for creating a new lesson
 * Matches backend schema exactly
 */
export interface LessonCreateRequest {
  classId: string;
  title: string;
  content: string; // Lesson content or instructions
  subject?: string | null;
  type?: 'assignment' | 'material' | 'lecture' | 'quiz';
  learningObjectives?: Array<{
    description: string;
    type?: string;
    isAchieved?: boolean;
    notes?: string | null;
  }> | null;
  lessonPlan?: string | null; // Private teacher notes
  maxPoints?: number | null; // For assignments
  dueDate?: string | null; // For assignments
}

/**
 * LessonUpdateRequest
 * Payload for updating an existing lesson
 * Matches backend schema exactly
 */
export interface LessonUpdateRequest {
  id: string;
  title?: string;
  content?: string;
  subject?: string | null;
  type?: 'assignment' | 'material' | 'lecture' | 'quiz';
  status?: LessonStatus;
  learningObjectives?: Array<{
    description: string;
    type?: string;
    isAchieved?: boolean;
    notes?: string | null;
  }> | null;
  lessonPlan?: string | null;
  maxPoints?: number | null;
  dueDate?: string | null;
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
