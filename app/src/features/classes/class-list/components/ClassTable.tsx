import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

import DataTable from '@/components/table/DataTable';
import { useClasses } from '../../shared/hooks';
import { useClassStore } from '../../shared/stores';
import type { Class } from '../../shared/types';
import { ClassActionsMenu } from './ClassActionsMenu';

export const ClassTable = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'table' });
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Class>();

  const handleRowClick = (row: any) => {
    navigate(`/classes/${row.original.id}`);
  };

  // Use selectors to prevent unnecessary re-renders
  const filters = useClassStore((state) => state.filters);
  const openEditModal = useClassStore((state) => state.openEditModal);
  const openEnrollmentModal = useClassStore((state) => state.openEnrollmentModal);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('columns.name'),
        cell: (info) => {
          return (
            <Link to={`/classes/${info.row.original.id}`} className="font-medium hover:underline">
              {info.getValue()}
            </Link>
          );
        },
        minSize: 200,
        meta: {
          isGrow: true,
        },
        enableSorting: true,
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
        size: 120,
      }),
      columnHelper.accessor('createdAt', {
        header: t('columns.createdAt'),
        cell: (info) => {
          const date = new Date(info.getValue());
          return <span>{date.toLocaleDateString()}</span>;
        },
        size: 150,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    data: classes,
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
        onClickRow={handleRowClick}
        rowStyle="cursor-pointer hover:bg-muted/50"
        showPagination={true}
      />
    </div>
  );
};
