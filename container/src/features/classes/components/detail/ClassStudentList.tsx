import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../types';

interface ClassStudentListProps {
  classData: Class;
}

const ClassStudentList = ({ classData }: ClassStudentListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('students.title', { count: classData.students.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {classData.students.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t('students.noStudents')}</p>
          ) : (
            <div className="space-y-2">
              {classData.students.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-muted-foreground text-sm">{student.studentCode}</p>
                  </div>
                  <div className="text-muted-foreground text-sm">{student.status}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassStudentList;
