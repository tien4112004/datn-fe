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

export interface LearningObjective {
  id: string;
  lessonPlanId: string;
  description: string;
  type: ObjectiveType;
  isAchieved: boolean;
  notes?: string;
  createdAt: string;
}

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

export interface LessonPlanUpdateRequest extends Partial<LessonPlanCreateRequest> {
  id: string;
  status?: LessonStatus;
}

export interface LearningObjectiveUpdateRequest {
  id: string;
  description?: string;
  type?: ObjectiveType;
  isAchieved?: boolean;
  notes?: string;
}

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

// Vietnamese education objective types
export const OBJECTIVE_TYPES = {
  knowledge: { code: 'knowledge', name: 'Kiến thức', nameEn: 'Knowledge' },
  skill: { code: 'skill', name: 'Kỹ năng', nameEn: 'Skill' },
  attitude: { code: 'attitude', name: 'Thái độ', nameEn: 'Attitude' },
  competency: { code: 'competency', name: 'Năng lực', nameEn: 'Competency' },
} as const;

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

export const LESSON_STATUS_OPTIONS = {
  planned: { code: 'planned', name: 'Đã lên kế hoạch', nameEn: 'Planned', color: 'blue' },
  in_progress: { code: 'in_progress', name: 'Đang thực hiện', nameEn: 'In Progress', color: 'yellow' },
  completed: { code: 'completed', name: 'Hoàn thành', nameEn: 'Completed', color: 'green' },
  cancelled: { code: 'cancelled', name: 'Đã hủy', nameEn: 'Cancelled', color: 'red' },
} as const;
