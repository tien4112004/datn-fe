import { Calendar, GraduationCap, Users } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Class } from '../../shared/types';
import { ClassActionsMenu } from './ClassActionsMenu';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { getGradeLabel } from '../../shared/utils/grades';

export const ClassCard = memo(
  ({
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
    const { t: tCommon } = useTranslation('common');

    return (
      <div className="hover:bg-muted/30 group border-b py-6 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            {/* Title and Status */}
            <div className="flex items-center gap-3">
              <Link
                to={`/classes/${classItem.id}`}
                className="hover:text-primary text-xl font-semibold transition-colors"
              >
                {classItem.name}
              </Link>
              <Badge variant={classItem.isActive ? 'default' : 'secondary'} className="text-xs">
                {classItem.isActive ? tCommon('status.active') : tCommon('status.inactive')}
              </Badge>
            </div>

            {/* Metadata */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {classItem.grade && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  <span>{getGradeLabel(classItem.grade)}</span>
                </div>
              )}

              {classItem.academicYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{classItem.academicYear}</span>
                </div>
              )}

              {classItem.currentEnrollment !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>
                    {classItem.currentEnrollment} {classItem.currentEnrollment === 1 ? 'student' : 'students'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <ClassActionsMenu
            classData={classItem}
            onEdit={onEdit}
            onManageStudents={onManageStudents}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }
);

ClassCard.displayName = 'ClassCard';
