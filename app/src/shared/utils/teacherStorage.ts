const STORAGE_KEY = 'class-teacher';

interface TeacherInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export function saveTeacher(teacher: TeacherInfo): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teacher));
}

export function getTeacher(): TeacherInfo | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
