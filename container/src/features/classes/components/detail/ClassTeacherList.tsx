import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../types';

interface ClassTeacherListProps {
  classData: Class;
}

const ClassTeacherList = ({ classData }: ClassTeacherListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="space-y-6">
      {/* Homeroom Teacher */}
      <Card>
        <CardHeader>
          <CardTitle>{t('teachers.homeroomTeacher')}</CardTitle>
        </CardHeader>
        <CardContent>
          {classData.homeroomTeacher ? (
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{classData.homeroomTeacher.fullName}</p>
                <p className="text-muted-foreground text-sm">{classData.homeroomTeacher.teacherCode}</p>
                <p className="text-muted-foreground text-sm">{classData.homeroomTeacher.email}</p>
              </div>
              <Badge>{t('teachers.homeroom')}</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">{t('teachers.noHomeroomTeacher')}</p>
          )}
        </CardContent>
      </Card>

      {/* Subject Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>{t('teachers.subjectTeachers', { count: classData.subjectTeachers.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {classData.subjectTeachers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t('teachers.noSubjectTeachers')}</p>
          ) : (
            <div className="space-y-2">
              {classData.subjectTeachers.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{assignment.teacher.fullName}</p>
                    <p className="text-muted-foreground text-sm">{assignment.teacher.teacherCode}</p>
                    <p className="text-muted-foreground text-sm">{assignment.teacher.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{assignment.subject}</Badge>
                    {assignment.isMainTeacher && <Badge className="ml-2">{t('teachers.main')}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassTeacherList;
