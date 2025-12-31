import { useTranslation } from 'react-i18next';

import { useClasses } from '../../shared/hooks';
import { useClassStore } from '../../shared/stores';
import { ClassCard } from './ClassCard';
import TablePagination from '@/components/table/TablePagination';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

export const ClassGrid = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'grid' });

  // Use selectors to prevent unnecessary re-renders
  const filters = useClassStore((state) => state.filters);
  const openEditModal = useClassStore((state) => state.openEditModal);
  const openEnrollmentModal = useClassStore((state) => state.openEnrollmentModal);

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
    data: classes,
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
      <div className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse py-6">
            <div className="space-y-3">
              {/* Title and badges skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-6 w-48 rounded bg-gray-200"></div>
                <div className="h-5 w-16 rounded-full bg-gray-200"></div>
              </div>
              {/* Metadata skeleton */}
              <div className="flex gap-4">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-28 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 border-l-4 p-6">
        <div className="text-destructive">
          <p>{t('error')}</p>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-muted-foreground">
          <p>{t('noClasses')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="divide-y">
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
