import { type Class } from '../../types';

// Flat class records - no nested objects
// Relationships are handled via foreign keys:
// - students -> students table (via classId FK)
// - subjects -> class-subjects table
// - layout -> seating-layouts and seating-seats tables
export const classesTable: Omit<Class, 'students' | 'subjects' | 'layout'>[] = [
  {
    id: '1',
    name: '1A',
    grade: 1,
    academicYear: '2024-2025',
    currentEnrollment: 15,
    class: 'Phòng 1.1',
    description:
      'Lớp 1A - Khối 1. Lớp học vui vẻ, năng động với đầy đủ các môn học cơ bản và hoạt động ngoại khóa.',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-23T00:00:00Z',
    isActive: true,
    teacherId: '1',
    ownerId: '1',
  },
  {
    id: '2',
    name: '3B',
    grade: 3,
    academicYear: '2024-2025',
    currentEnrollment: 15,
    class: 'Phòng 2.2',
    description: 'Lớp 3B - Khối 3. Tăng cường Tiếng Anh và Tin học, phát triển toàn diện kỹ năng sống.',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-23T00:00:00Z',
    isActive: true,
    teacherId: '1',
    ownerId: '1',
  },
  {
    id: '3',
    name: '5C',
    grade: 5,
    academicYear: '2024-2025',
    currentEnrollment: 15,
    class: 'Phòng 3.3',
    description:
      'Lớp 5C - Khối 5. Lớp cuối cấp tiểu học, trang bị đầy đủ kiến thức và kỹ năng chuẩn bị chuyển lên THCS.',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-09-23T00:00:00Z',
    isActive: true,
    teacherId: '1',
    ownerId: '1',
  },
];
