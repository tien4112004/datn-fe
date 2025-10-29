/**
 * Lesson Plan Entities
 *
 * Represents lesson plans, learning objectives, and teaching resources.
 */

/**
 * LessonPlan Entity
 *
 * A detailed plan for teaching a specific subject during a class period.
 */
export interface LessonPlan {
  id: string;
  classId: string;
  className: string;
  subject: string;
  subjectCode: string;
  title: string;
  description?: string;
  date: string; // "2024-09-29"
  periodId?: string; // Link to ClassPeriod
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  duration: number; // minutes
  teacherId: string;
  teacher: {
    id: string;
    fullName: string;
    email: string;
  };
  objectives: LearningObjective[];
  resources: LessonResource[];
  status: LessonStatus;
  notes?: string;
  preparationTime?: number; // minutes needed for preparation
  createdAt: string;
  updatedAt: string;
}

/**
 * LearningObjective Entity
 *
 * A specific learning goal for a lesson (knowledge, skill, attitude, or competency).
 */
export interface LearningObjective {
  id: string;
  lessonPlanId: string;
  description: string;
  type: ObjectiveType;
  isAchieved: boolean;
  notes?: string;
  createdAt: string;
}

/**
 * LessonResource Entity
 *
 * Teaching materials and resources needed for a lesson.
 */
export interface LessonResource {
  id: string;
  lessonPlanId: string;
  name: string;
  type: ResourceType;
  url?: string;
  filePath?: string;
  description?: string;
  isRequired: boolean;
  isPrepared: boolean;
  createdAt: string;
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
