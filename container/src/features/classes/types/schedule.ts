// Schedule and Period types
export interface ClassPeriod {
  id: string;
  classId: string;
  subject: string;
  subjectCode: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  teacherId: string;
  teacher: {
    id: string;
    fullName: string;
    email: string;
  };
  room?: string;
  isActive: boolean;
  lessonPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailySchedule {
  date: string; // "2024-09-29"
  classId: string;
  periods: ClassPeriod[];
}

export interface ScheduleCollectionRequest {
  classId: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number;
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
}

// Vietnamese school subjects
export const VIETNAMESE_SUBJECTS = {
  TOAN: { code: 'TOAN', name: 'Toán', nameEn: 'Mathematics' },
  VAN: { code: 'VAN', name: 'Ngữ văn', nameEn: 'Vietnamese Literature' },
  ANH: { code: 'ANH', name: 'Tiếng Anh', nameEn: 'English' },
  LY: { code: 'LY', name: 'Vật lý', nameEn: 'Physics' },
  HOA: { code: 'HOA', name: 'Hóa học', nameEn: 'Chemistry' },
  SINH: { code: 'SINH', name: 'Sinh học', nameEn: 'Biology' },
  SU: { code: 'SU', name: 'Lịch sử', nameEn: 'History' },
  DIA: { code: 'DIA', name: 'Địa lý', nameEn: 'Geography' },
  GDCD: { code: 'GDCD', name: 'Giáo dục công dân', nameEn: 'Civic Education' },
  GDQP: { code: 'GDQP', name: 'Giáo dục quốc phòng', nameEn: 'National Defense Education' },
  CN: { code: 'CN', name: 'Công nghệ', nameEn: 'Technology' },
  TIN: { code: 'TIN', name: 'Tin học', nameEn: 'Computer Science' },
  GDTC: { code: 'GDTC', name: 'Giáo dục thể chất', nameEn: 'Physical Education' },
  MY: { code: 'MY', name: 'Mỹ thuật', nameEn: 'Fine Arts' },
  NHAC: { code: 'NHAC', name: 'Âm nhạc', nameEn: 'Music' },
} as const;

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ 2', labelEn: 'Monday' },
  { value: 2, label: 'Thứ 3', labelEn: 'Tuesday' },
  { value: 3, label: 'Thứ 4', labelEn: 'Wednesday' },
  { value: 4, label: 'Thứ 5', labelEn: 'Thursday' },
  { value: 5, label: 'Thứ 6', labelEn: 'Friday' },
  { value: 6, label: 'Thứ 7', labelEn: 'Saturday' },
  { value: 0, label: 'Chủ nhật', labelEn: 'Sunday' },
] as const;

export const STANDARD_PERIODS = [
  { period: 1, startTime: '07:30', endTime: '08:15' },
  { period: 2, startTime: '08:15', endTime: '09:00' },
  { period: 3, startTime: '09:15', endTime: '10:00' },
  { period: 4, startTime: '10:00', endTime: '10:45' },
  { period: 5, startTime: '10:45', endTime: '11:30' },
  { period: 6, startTime: '13:30', endTime: '14:15' },
  { period: 7, startTime: '14:15', endTime: '15:00' },
  { period: 8, startTime: '15:15', endTime: '16:00' },
  { period: 9, startTime: '16:00', endTime: '16:45' },
  { period: 10, startTime: '16:45', endTime: '17:30' },
] as const;

export type SubjectCode = keyof typeof VIETNAMESE_SUBJECTS;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]['value'];
