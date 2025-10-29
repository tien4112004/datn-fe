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
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{classData.homeroomTeacher.fullName}</p>
                  <p className="text-muted-foreground text-sm">{classData.homeroomTeacher.teacherCode}</p>
                  <p className="text-muted-foreground text-sm">{classData.homeroomTeacher.email}</p>
                </div>
                <Badge>{t('teachers.homeroom')}</Badge>
              </div>

              {/* Subjects taught by homeroom teacher */}
              <div className="rounded border p-4">
                <h4 className="mb-3 font-semibold">Subjects</h4>
                {classData.subjects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No subjects assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {classData.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">{t('teachers.noHomeroomTeacher')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassTeacherList;
