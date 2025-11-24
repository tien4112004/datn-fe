# Data Model: Classes Feature Refactored Structure

**Feature**: Classes Feature Code Refactoring  
**Date**: 2025-10-29  
**Status**: Design

## Overview

This document describes the reorganized type structure for the classes feature after refactoring. The refactoring separates concerns into entities (domain objects), requests (API contracts), and constants (shared configuration), eliminating duplication and improving discoverability.

## Type Organization Principles

1. **Entities**: Core domain objects representing business concepts
2. **Requests**: API request/response types for data transfer
3. **Constants**: Shared enumerations, configurations, and lookup tables
4. **Separation of Concerns**: Each file has single clear purpose
5. **Backward Compatibility**: Barrel exports maintain existing import paths

## Entity Types

### Class Entity (`types/entities/class.ts`)

```typescript
export interface Class {
  id: string;
  name: string;
  grade: number;
  academicYear: string;
  homeroomTeacherId: string;
  homeroomTeacher?: Teacher;
  capacity: number;
  currentEnrollment: number;
  subjects: string[];
  description?: string;
  room?: string;
  schedule?: DailySchedule;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subjects: string[];
  isActive: boolean;
}
```

**Relationships**:
- Class → Teacher (homeroom, via `homeroomTeacherId`)
- Class → DailySchedule (via `schedule`)
- Class → Student[] (via enrollment, inverse relationship)

**Validation Rules**:
- `grade`: Must be 1-12 (from constants)
- `capacity`: MIN_CLASS_CAPACITY (20) to MAX_CLASS_CAPACITY (45)
- `currentEnrollment`: Cannot exceed `capacity`
- `academicYear`: Format "YYYY-YYYY" (e.g., "2024-2025")
- `subjects`: Must be from valid subject constants

### Student Entity (`types/entities/student.ts`)

```typescript
export interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  parentName: string;
  parentPhone: string;
  classId: string;
  enrollmentDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = 'active' | 'inactive' | 'transferred' | 'graduated';
```

**Relationships**:
- Student → Class (via `classId`)

**Validation Rules**:
- `dateOfBirth`: Must be valid date, student age appropriate for grade
- `parentPhone`: Vietnamese phone format validation
- `status`: Must be one of valid StudentStatus values
- `enrollmentDate`: Cannot be in future

### Schedule Entity (`types/entities/schedule.ts`)

```typescript
export interface ClassPeriod {
  id: string;
  classId: string;
  subject: string;
  subjectCode: string;
  dayOfWeek: number; // 1-5 (Monday-Friday)
  startTime: string; // "HH:MM" format
  endTime: string;
  teacherId: string;
  teacher?: TeacherInfo;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailySchedule {
  id: string;
  classId: string;
  className: string;
  grade: number;
  periods: ClassPeriod[];
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherInfo {
  id: string;
  fullName: string;
  email: string;
}
```

**Relationships**:
- ClassPeriod → Class (via `classId`)
- ClassPeriod → Teacher (via `teacherId`)
- DailySchedule → ClassPeriod[] (composition)

**Validation Rules**:
- `dayOfWeek`: 1-5 (Monday-Friday)
- `startTime`/`endTime`: Valid time format, endTime > startTime
- `subject`/`subjectCode`: Must match constants
- Period duration typically 45 minutes (elementary) or 45-60 minutes (secondary)

### Lesson Entity (`types/entities/lesson.ts`)

```typescript
export interface Lesson {
  id: string;
  classId: string;
  className: string;
  subject: string;
  subjectCode: string;
  title: string;
  description?: string;
  date: string; // ISO date
  periodId?: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  teacherId: string;
  teacher?: TeacherInfo;
  objectives: LearningObjective[];
  resources: LessonResource[];
  status: LessonStatus;
  preparationTime?: number; // minutes
  createdAt: string;
  updatedAt: string;
}

export interface LearningObjective {
  id: string;
  lessonId: string;
  description: string;
  type: ObjectiveType;
  bloomLevel?: string;
  order: number;
  isAchieved?: boolean;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  name: string;
  type: ResourceType;
  url?: string;
  description?: string;
  order: number;
}

export type LessonStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ObjectiveType = 'knowledge' | 'skills' | 'attitudes';
export type ResourceType = 'presentation' | 'mindmap' | 'document' | 'video' | 
  'audio' | 'image' | 'worksheet' | 'equipment' | 'other';
```

**Relationships**:
- Lesson → Class (via `classId`)
- Lesson → Teacher (via `teacherId`)
- Lesson → ClassPeriod (optional, via `periodId`)
- Lesson → LearningObjective[] (composition)
- Lesson → LessonResource[] (composition)

**Validation Rules**:
- `date`: Valid ISO date format
- `duration`: Positive integer, typically 45-90 minutes
- `objectives`: Must have at least 1 objective
- `status`: Must be valid LessonStatus
- `bloomLevel`: Optional, from Bloom's Taxonomy levels

## Request Types

### Class Requests (`types/requests/classRequests.ts`)

```typescript
export interface ClassCollectionRequest {
  page?: number;
  limit?: number;
  search?: string;
  grade?: number;
  academicYear?: string;
  homeroomTeacherId?: string;
  isActive?: boolean;
  sort?: string; // Format: "field:asc|desc"
}

export interface ClassCreateRequest {
  name: string;
  grade: number;
  academicYear: string;
  homeroomTeacherId: string;
  capacity?: number;
  subjects: string[];
  description?: string;
  room?: string;
}

export interface ClassUpdateRequest extends Partial<ClassCreateRequest> {
  id: string;
  isActive?: boolean;
}
```

### Student Requests (`types/requests/studentRequests.ts`)

```typescript
export interface StudentCollectionRequest {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  status?: StudentStatus;
  grade?: number;
  sort?: string;
}

export interface StudentEnrollmentRequest {
  studentId: string;
  classId: string;
  enrollmentDate: string;
}

export interface StudentTransferRequest {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  transferDate: string;
  reason?: string;
}
```

### Schedule Requests (`types/requests/scheduleRequests.ts`)

```typescript
export interface ScheduleCollectionRequest {
  classId?: string;
  dayOfWeek?: number;
  teacherId?: string;
  academicYear?: string;
}

export interface ClassPeriodCreateRequest {
  classId: string;
  subject: string;
  subjectCode: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  teacherId: string;
  room?: string;
}

export interface ClassPeriodUpdateRequest extends Partial<ClassPeriodCreateRequest> {
  id: string;
  isActive?: boolean;
}
```

### Lesson Requests (`types/requests/lessonRequests.ts`)

```typescript
export interface LessonCollectionRequest {
  page?: number;
  limit?: number;
  classId?: string;
  teacherId?: string;
  subject?: string;
  status?: LessonStatus;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}

export interface LessonCreateRequest {
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
  objectives: Omit<LearningObjective, 'id' | 'lessonId'>[];
  resources: Omit<LessonResource, 'id' | 'lessonId'>[];
  preparationTime?: number;
}

export interface LessonUpdateRequest extends Partial<LessonCreateRequest> {
  id: string;
  status?: LessonStatus;
}
```

## Constants

### Subjects (`types/constants/subjects.ts`)

**Consolidates duplicate subject definitions from multiple files**

```typescript
// Elementary School Subjects (Grades 1-5)
export const ELEMENTARY_SUBJECTS = {
  TIENG_VIET: { code: 'TV', name: 'Tiếng Việt', nameEn: 'Vietnamese' },
  TOAN: { code: 'T', name: 'Toán', nameEn: 'Mathematics' },
  DAO_DUC: { code: 'DD', name: 'Đạo đức', nameEn: 'Ethics' },
  TU_NHIEN_XA_HOI: { code: 'TNXH', name: 'Tự nhiên và Xã hội', nameEn: 'Nature & Society' },
  KHOA_HOC: { code: 'KH', name: 'Khoa học', nameEn: 'Science' },
  LICH_SU_DIA_LY: { code: 'LSDL', name: 'Lịch sử và Địa lý', nameEn: 'History & Geography' },
  TIENG_ANH: { code: 'TA', name: 'Tiếng Anh', nameEn: 'English' },
  TIN_HOC: { code: 'TH', name: 'Tin học và Công nghệ', nameEn: 'Computer & Technology' },
  AM_NHAC: { code: 'AN', name: 'Âm nhạc', nameEn: 'Music' },
  MY_THUAT: { code: 'MT', name: 'Mỹ thuật', nameEn: 'Arts' },
  GIAO_DUC_THE_CHAT: { code: 'GDTC', name: 'Giáo dục thể chất', nameEn: 'Physical Education' },
  HOAT_DONG_TRAI_NGHIEM: { code: 'KC', name: 'Hoạt động trải nghiệm', nameEn: 'Experiential Activities' },
} as const;

// Secondary School Subjects (Grades 6-12)
export const SECONDARY_SUBJECTS = {
  TOAN: { code: 'TOAN', name: 'Toán', nameEn: 'Mathematics' },
  VAN: { code: 'VAN', name: 'Ngữ văn', nameEn: 'Literature' },
  ANH: { code: 'ANH', name: 'Tiếng Anh', nameEn: 'English' },
  LY: { code: 'LY', name: 'Vật lý', nameEn: 'Physics' },
  HOA: { code: 'HOA', name: 'Hóa học', nameEn: 'Chemistry' },
  SINH: { code: 'SINH', name: 'Sinh học', nameEn: 'Biology' },
  SU: { code: 'SU', name: 'Lịch sử', nameEn: 'History' },
  DIA: { code: 'DIA', name: 'Địa lý', nameEn: 'Geography' },
  GDCD: { code: 'GDCD', name: 'Giáo dục công dân', nameEn: 'Civic Education' },
  CN: { code: 'CN', name: 'Công nghệ', nameEn: 'Technology' },
  TIN: { code: 'TIN', name: 'Tin học', nameEn: 'Computer Science' },
  TD: { code: 'TD', name: 'Thể dục', nameEn: 'Physical Education' },
  NHAC: { code: 'NHAC', name: 'Âm nhạc', nameEn: 'Music' },
  MT: { code: 'MT', name: 'Mỹ thuật', nameEn: 'Arts' },
} as const;

// Helper functions
export function getSubjectByCode(code: string, grade: number) {
  const subjects = grade <= 5 ? ELEMENTARY_SUBJECTS : SECONDARY_SUBJECTS;
  return Object.values(subjects).find(s => s.code === code);
}

export function getSubjectsByGrade(grade: number) {
  return grade <= 5 
    ? Object.values(ELEMENTARY_SUBJECTS)
    : Object.values(SECONDARY_SUBJECTS);
}
```

### Grades (`types/constants/grades.ts`)

```typescript
export const GRADE_LEVELS = {
  1: 'Lớp 1',
  2: 'Lớp 2',
  3: 'Lớp 3',
  4: 'Lớp 4',
  5: 'Lớp 5',
  6: 'Lớp 6',
  7: 'Lớp 7',
  8: 'Lớp 8',
  9: 'Lớp 9',
  10: 'Lớp 10',
  11: 'Lớp 11',
  12: 'Lớp 12',
} as const;

export const CLASS_TRACKS = ['A', 'B', 'C', 'D'] as const;

export const DEFAULT_CLASS_CAPACITY = 35;
export const MAX_CLASS_CAPACITY = 45;
export const MIN_CLASS_CAPACITY = 20;

export type GradeLevel = keyof typeof GRADE_LEVELS;
export type ClassTrack = (typeof CLASS_TRACKS)[number];
```

### Statuses (`types/constants/statuses.ts`)

```typescript
export const LESSON_STATUS_OPTIONS = {
  planned: { code: 'planned', name: 'Đã lên kế hoạch', nameEn: 'Planned', color: 'blue' },
  in_progress: { code: 'in_progress', name: 'Đang thực hiện', nameEn: 'In Progress', color: 'yellow' },
  completed: { code: 'completed', name: 'Hoàn thành', nameEn: 'Completed', color: 'green' },
  cancelled: { code: 'cancelled', name: 'Đã hủy', nameEn: 'Cancelled', color: 'red' },
} as const;

export const STUDENT_STATUS_OPTIONS = {
  active: { code: 'active', name: 'Đang học', nameEn: 'Active', color: 'green' },
  inactive: { code: 'inactive', name: 'Tạm nghỉ', nameEn: 'Inactive', color: 'gray' },
  transferred: { code: 'transferred', name: 'Đã chuyển', nameEn: 'Transferred', color: 'blue' },
  graduated: { code: 'graduated', name: 'Đã tốt nghiệp', nameEn: 'Graduated', color: 'purple' },
} as const;

export const RESOURCE_TYPE_OPTIONS = {
  presentation: { code: 'presentation', name: 'Bài thuyết trình', nameEn: 'Presentation', icon: 'presentation' },
  mindmap: { code: 'mindmap', name: 'Sơ đồ tư duy', nameEn: 'Mindmap', icon: 'mind-map' },
  document: { code: 'document', name: 'Tài liệu', nameEn: 'Document', icon: 'file-text' },
  video: { code: 'video', name: 'Video', nameEn: 'Video', icon: 'video' },
  audio: { code: 'audio', name: 'Âm thanh', nameEn: 'Audio', icon: 'audio' },
  image: { code: 'image', name: 'Hình ảnh', nameEn: 'Image', icon: 'image' },
  worksheet: { code: 'worksheet', name: 'Bài tập', nameEn: 'Worksheet', icon: 'file-edit' },
  equipment: { code: 'equipment', name: 'Thiết bị', nameEn: 'Equipment', icon: 'monitor' },
  other: { code: 'other', name: 'Khác', nameEn: 'Other', icon: 'more-horizontal' },
} as const;
```

## Barrel Exports (`types/index.ts`)

**Maintains backward compatibility with existing imports**

```typescript
// Entity exports
export * from './entities/class';
export * from './entities/student';
export * from './entities/schedule';
export * from './entities/lesson';

// Request exports
export * from './requests/classRequests';
export * from './requests/studentRequests';
export * from './requests/scheduleRequests';
export * from './requests/lessonRequests';

// Constants exports
export * from './constants/subjects';
export * from './constants/grades';
export * from './constants/statuses';
```

## Migration Path

Existing code importing from old structure:
```typescript
import type { Class, ClassCollectionRequest, ELEMENTARY_SUBJECTS } from '@/features/classes/types';
```

Continues to work through barrel exports. Internal refactoring allows gradual migration to specific paths:
```typescript
import type { Class } from '@/features/classes/types/entities/class';
import type { ClassCollectionRequest } from '@/features/classes/types/requests/classRequests';
import { ELEMENTARY_SUBJECTS } from '@/features/classes/types/constants/subjects';
```

## Benefits of Refactored Structure

1. **Single Source of Truth**: Subject constants consolidated from 3 files to 1
2. **Clear Separation**: Entities, requests, and constants have distinct purposes
3. **Improved Discoverability**: Domain-based organization makes types easier to find
4. **Reduced Coupling**: Changing entity shape doesn't affect request types
5. **Better Testability**: Smaller, focused files are easier to test
6. **Backward Compatible**: Existing imports continue working through barrel exports
7. **Type Safety**: Maintains 100% TypeScript coverage with explicit types
