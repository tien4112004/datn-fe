/**
 * Lesson Plan Entities
 *
 * Represents lesson plans, learning objectives, and teaching resources.
 */

import type { MinimalSchedulePeriod } from '../../class-schedule/types/schedule';

/**
 * Lesson Entity
 *
 * A detailed plan for teaching a specific subject during a class period.
 * Matches backend Lesson schema
 */
export interface Lesson {
  // Backend fields
  id: string;
  classId: string;
  authorId: string; // ID of the teacher/author
  title: string;
  subject?: string | null; // Subject code
  content: string; // Lesson content or instructions
  type?: 'assignment' | 'material' | 'lecture' | 'quiz';
  status: LessonStatus;
  learningObjectives?: LearningObjective[] | null;
  lessonPlan?: string | null; // Private teacher notes/plan
  maxPoints?: number | null; // For assignments
  dueDate?: string | null; // For assignments
  createdAt?: string;
  updatedAt?: string;

  // Legacy/compatibility fields
  className?: string;
  description?: string; // Use content instead
  duration?: number; // minutes
  linkedPeriods?: MinimalSchedulePeriod[];
  objectives?: LearningObjective[]; // Alias for learningObjectives
  resources?: LessonResource[];
  notes?: string; // Use lessonPlan instead
}

/**
 * LearningObjective Entity
 *
 * A specific learning goal for a lesson (knowledge, skill, attitude, or competency).
 */
export interface LearningObjective {
  id: string; // Required ID for all objectives
  description: string;
  type: ObjectiveType;
  isAchieved: boolean;
  notes?: string;
}

/**
 * LessonResource Entity
 *
 * Teaching materials and resources needed for a lesson.
 */
export interface LessonResource {
  id: string; // Required ID for all resources
  name: string;
  type: ResourceType;
  url?: string;
  filePath?: string;
  description?: string;
  isRequired: boolean;
  isPrepared: boolean;
}

export type LessonStatus =
  | 'draft'
  | 'published'
  | 'archived'
  // Legacy statuses for backwards compatibility
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ObjectiveType =
  | 'knowledge' // Kiến thức
  | 'skill' // Kỹ năng
  | 'attitude' // Thái độ
  | 'competency'; // Năng lực

export type ResourceType =
  | 'presentation' // Bài thuyết trình
  | 'mindmap' // Sơ đồ tư duy
  | 'document' // Tài liệu
  | 'video' // Video
  | 'audio' // Âm thanh
  | 'image' // Hình ảnh
  | 'worksheet' // Bài tập
  | 'equipment' // Thiết bị
  | 'other'; // Khác
