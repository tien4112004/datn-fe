import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

import DataTable from '@/components/table/DataTable';
import { useClasses } from '../../shared/hooks';
import { useClassStore } from '../../shared/stores';
import { getGradeLabel } from '../../shared/utils/grades';
import type { Class } from '../../shared/types';
import { ClassActionsMenu } from './ClassActionsMenu';

export const ClassTable = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'table' });
  const { t: tCommon } = useTranslation('common');
  const columnHelper = createColumnHelper<Class>();

  const { filters, openEditModal, openEnrollmentModal } = useClassStore();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('columns.name'),
        cell: (info) => {
          const classItem = info.row.original;
          return (
            <div>
              <Link to={`/classes/${classItem.id}`} className="font-medium hover:underline">
                {info.getValue()}
              </Link>
              {classItem.description && (
                <p className="text-muted-foreground max-w-[200px] truncate text-sm">
                  {classItem.description}
                </p>
              )}
            </div>
          );
        },
        minSize: 200,
        meta: {
          isGrow: true,
        },
        enableSorting: true,
      }),
      columnHelper.accessor('grade', {
        header: t('columns.grade'),
        cell: (info) => {
          return <span>{getGradeLabel(info.getValue())}</span>;
        },
        size: 120,
      }),
      columnHelper.accessor('academicYear', {
        header: t('columns.academicYear'),
        cell: (info) => info.getValue(),
        size: 120,
      }),
      columnHelper.display({
        header: t('columns.enrollment'),
        cell: (info) => {
          const classItem = info.row.original;
          return <span className="font-medium">{classItem.currentEnrollment}</span>;
        },
        size: 160,
      }),
      columnHelper.accessor('classroom', {
        header: t('columns.classroom'),
        cell: (info) => info.getValue() || <span className="text-muted-foreground">-</span>,
        size: 100,
      }),
      columnHelper.display({
        header: t('columns.status'),
        cell: (info) => {
          const classItem = info.row.original;
          return (
            <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
              {classItem.isActive ? tCommon('status.active') : tCommon('status.inactive')}
            </Badge>
          );
        },
        size: 100,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const classItem = info.row.original;
          return (
            <ClassActionsMenu
              classData={classItem}
              onEdit={openEditModal}
              onManageStudents={openEnrollmentModal}
              onDelete={() => console.log('Delete class:', classItem.id)}
            />
          );
        },
        size: 50,
        enableResizing: false,
      }),
    ],
    [t, tCommon]
  );

  // Use the updated hook with sorting, pagination, and search management
  const {
    data: classes,
    isLoading,
    sorting,
    setSorting,
    pagination,
    setPagination,
    totalItems,
  } = useClasses(filters);

  const table = useReactTable({
    data: [...classes],
    columns: columns,
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

  return (
    <div className="w-full">
      <DataTable
        table={table}
        isLoading={isLoading}
        emptyState={<div className="text-muted-foreground">{t('noClasses')}</div>}
        showPagination={true}
      />
    </div>
  );
};
