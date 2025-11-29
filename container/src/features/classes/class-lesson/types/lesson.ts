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
 */
export interface Lesson {
  id: string;
  classId: string;
  className: string;
  subject?: string; // Subject code
  title: string;
  description?: string;
  duration: number; // minutes
  linkedPeriods: MinimalSchedulePeriod[];
  objectives: LearningObjective[];
  resources: LessonResource[];
  status: LessonStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export type LessonStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

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
