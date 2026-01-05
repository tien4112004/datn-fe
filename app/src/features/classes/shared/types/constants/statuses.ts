/**
 * Status Constants
 *
 * Status enums and configuration for classes and lessons.
 */

// Lesson plan status options
export const LESSON_STATUS = {
  planned: { code: 'planned', name: 'Đã lên kế hoạch', nameEn: 'Planned', color: 'blue' },
  in_progress: {
    code: 'in_progress',
    name: 'Đang thực hiện',
    nameEn: 'In Progress',
    color: 'yellow',
  },
  completed: { code: 'completed', name: 'Hoàn thành', nameEn: 'Completed', color: 'green' },
  cancelled: { code: 'cancelled', name: 'Đã hủy', nameEn: 'Cancelled', color: 'red' },
} as const;

// Learning objective types (Vietnamese education framework)
export const OBJECTIVE_TYPES = {
  knowledge: { code: 'knowledge', name: 'Kiến thức', nameEn: 'Knowledge' },
  skill: { code: 'skill', name: 'Kỹ năng', nameEn: 'Skill' },
  attitude: { code: 'attitude', name: 'Thái độ', nameEn: 'Attitude' },
  competency: { code: 'competency', name: 'Năng lực', nameEn: 'Competency' },
} as const;

// Lesson resource types
export const RESOURCE_TYPES = {
  presentation: {
    code: 'presentation',
    name: 'Bài thuyết trình',
    nameEn: 'Presentation',
    icon: 'presentation',
  },
  mindmap: { code: 'mindmap', name: 'Sơ đồ tư duy', nameEn: 'Mindmap', icon: 'mind-map' },
  document: { code: 'document', name: 'Tài liệu', nameEn: 'Document', icon: 'file-text' },
  video: { code: 'video', name: 'Video', nameEn: 'Video', icon: 'video' },
  audio: { code: 'audio', name: 'Âm thanh', nameEn: 'Audio', icon: 'audio' },
  image: { code: 'image', name: 'Hình ảnh', nameEn: 'Image', icon: 'image' },
  worksheet: { code: 'worksheet', name: 'Bài tập', nameEn: 'Worksheet', icon: 'file-edit' },
  equipment: { code: 'equipment', name: 'Thiết bị', nameEn: 'Equipment', icon: 'monitor' },
  other: { code: 'other', name: 'Khác', nameEn: 'Other', icon: 'more-horizontal' },
} as const;

export type LessonStatusCode = keyof typeof LESSON_STATUS;
export type ObjectiveTypeCode = keyof typeof OBJECTIVE_TYPES;
export type ResourceTypeCode = keyof typeof RESOURCE_TYPES;
