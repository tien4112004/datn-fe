import { CardHeader, CardTitle, CardContent, Card } from '@/components/ui/card';
import { Users, MapPin } from 'lucide-react';
import { getGradeLabel } from '../../shared/utils/grades';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../shared/types';
import { ClassActionsMenu } from './ClassActionsMenu';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const ClassCard = ({
  classItem,
  onEdit,
  onManageStudents,
  onDelete,
}: {
  classItem: Class;
  onEdit: (classItem: Class) => void;
  onManageStudents: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
}) => {
  const { t } = useTranslation('classes', { keyPrefix: 'grid' });
  const { t: tCommon } = useTranslation('common');

  return (
    <Card key={classItem.id} className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link to={`/classes/${classItem.id}`} className="hover:underline">
                {classItem.name}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getGradeLabel(classItem.grade)}
              </Badge>
              <Badge variant={classItem.isActive ? 'default' : 'secondary'} className="text-xs">
                {classItem.isActive ? tCommon('status.active') : tCommon('status.inactive')}
              </Badge>
            </div>
          </div>

          <ClassActionsMenu
            classData={classItem}
            onEdit={onEdit}
            onManageStudents={onManageStudents}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {classItem.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{classItem.description}</p>
        )}

        <div className="space-y-3">
          {/* Academic Year */}
          <div className="text-sm">
            <span className="text-muted-foreground">{t('academicYear')}: </span>
            <span className="font-medium">{classItem.academicYear}</span>
          </div>

          {/* Enrollment */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4" />
              {t('enrollment')}:<span className="font-medium">{classItem.currentEnrollment}</span>
            </div>
          </div>

          {/* Class */}
          {classItem.class && (
            <div className="text-sm">
              <div className="text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {t('class')}
              </div>
              <span className="font-medium">{classItem.class}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
