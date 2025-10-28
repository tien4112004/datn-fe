import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { useClasses } from '../../shared/hooks';
import { useClassStore } from '../../shared/stores';
import { ClassCard } from './ClassCard';
import TablePagination from '@/components/table/TablePagination';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

export const ClassGrid = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'grid' });

  const { filters, openEditModal, openEnrollmentModal } = useClassStore();

  const {
    data: classes,
    isLoading,
    error,
    pagination,
    setPagination,
    totalItems,
    sorting,
    setSorting,
  } = useClasses({
    ...filters,
    pageSize: 12,
  });

  const table = useReactTable({
    data: [...classes],
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      sorting,
      pagination,
    },
    rowCount: totalItems,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <ClassCard
            key={classItem.id}
            classItem={classItem}
            onEdit={() => openEditModal(classItem)}
            onManageStudents={() => openEnrollmentModal(classItem)}
            onDelete={() => console.log('Delete class:', classItem.id)}
          />
        ))}
      </div>

      <TablePagination table={table} pageSizeOptions={[3, 6, 12, 24]} />
    </div>
  );
};

export default ClassGrid;
