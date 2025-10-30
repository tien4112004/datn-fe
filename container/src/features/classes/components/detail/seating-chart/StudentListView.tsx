import type { Student } from '@/features/classes/types';

interface StudentListViewProps {
  students: Student[];
}

export const StudentListView = ({ students }: StudentListViewProps) => {
  if (students.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No students enrolled</p>;
  }

  return (
    <div className="space-y-2">
      {students.map((student) => (
        <div key={student.id} className="flex items-center justify-between rounded border p-3">
          <div>
            <p className="font-medium">{student.fullName}</p>
            <p className="text-muted-foreground text-sm">{student.studentCode}</p>
          </div>
          <div className="text-muted-foreground text-sm">{student.status}</div>
        </div>
      ))}
    </div>
  );
};
