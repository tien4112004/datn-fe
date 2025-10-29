import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Users, Trash2, Eye, UserCheck, MapPin } from 'lucide-react';

import { useClasses } from '../../hooks';
import { useClassStore } from '../../stores';
import { getGradeLabel } from '../../utils';
import type { Class } from '../../types';

const ClassGrid = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'grid' });
  const { t: tCommon } = useTranslation('common');

  const { filters } = useClassStore();
  const { openEditModal, openEnrollmentModal } = useClassStore();

  const handleEdit = (classData: Class) => {
    openEditModal(classData);
  };

  const handleManageStudents = (classData: Class) => {
    openEnrollmentModal(classData);
  };

  // Use the updated hook with pagination management
  const {
    data: classes,
    isLoading,
    error,
    pagination,
    setPagination,
  } = useClasses({
    ...filters,
    pageSize: 12,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-3 w-3/4 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-destructive text-center">
            <p>{t('error')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-muted-foreground text-center">
            <p>{t('noClasses')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPage = pagination.pageIndex;
  const totalPages = Math.ceil((classes.length || 0) / pagination.pageSize);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
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
                    {classItem.track && (
                      <Badge variant="secondary" className="text-xs">
                        {classItem.track}
                      </Badge>
                    )}
                    <Badge variant={classItem.isActive ? 'default' : 'secondary'} className="text-xs">
                      {classItem.isActive ? tCommon('status.active') : tCommon('status.inactive')}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/classes/${classItem.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        {tCommon('actions.view')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(classItem)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {tCommon('actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleManageStudents(classItem)}>
                      <Users className="mr-2 h-4 w-4" />
                      {t('actions.manageStudents')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {tCommon('actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {t('enrollment')}
                    </span>
                    <span className="font-medium">
                      {classItem.currentEnrollment}/{classItem.capacity}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        classItem.currentEnrollment >= classItem.capacity
                          ? 'bg-red-500'
                          : classItem.currentEnrollment >= classItem.capacity * 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((classItem.currentEnrollment / classItem.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Homeroom Teacher */}
                <div className="text-sm">
                  <div className="text-muted-foreground mb-1 flex items-center gap-1">
                    <UserCheck className="h-4 w-4" />
                    {t('homeroomTeacher')}
                  </div>
                  {classItem.homeroomTeacher ? (
                    <span className="font-medium">{classItem.homeroomTeacher.fullName}</span>
                  ) : (
                    <span className="text-muted-foreground italic">{t('noHomeroomTeacher')}</span>
                  )}
                </div>

                {/* Classroom */}
                {classItem.classroom && (
                  <div className="text-sm">
                    <div className="text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {t('classroom')}
                    </div>
                    <span className="font-medium">{classItem.classroom}</span>
                  </div>
                )}

                {/* Subjects Count */}
                <div className="text-sm">
                  <span className="text-muted-foreground">Subjects: </span>
                  <span className="font-medium">{classItem.subjects.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {t('pagination.showing', {
              start: currentPage * pagination.pageSize + 1,
              end: Math.min((currentPage + 1) * pagination.pageSize, classes.length),
              total: classes.length,
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={currentPage === 0}
            >
              {tCommon('pagination.previous')}
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: i }))}
                  className="h-8 w-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={currentPage >= totalPages - 1}
            >
              {tCommon('pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassGrid;
