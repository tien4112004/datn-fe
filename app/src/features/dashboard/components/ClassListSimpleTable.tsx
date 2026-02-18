import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@ui/badge';

import DataTable from '@/shared/components/table/DataTable';
import { useClasses } from '@/features/classes/shared/hooks';
import { useClassStore } from '@/features/classes/shared/stores';
import type { Class } from '@/features/classes/shared/types';

export const ClassListSimpleTable = () => {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<Class>();

  const filters = useClassStore((state) => state.filters);
  const { data: classes, isLoading } = useClasses(filters);

  const handleRowClick = (row: any) => {
    navigate(`/classes/${row.original.id}`);
  };

  // Show only first 4 classes for dashboard
  const displayClasses = useMemo(() => classes.slice(0, 4), [classes]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('myClasses.table.columns.className'),
        cell: (info) => {
          return <span className="truncate text-sm font-medium sm:text-base">{info.getValue()}</span>;
        },
        enableSorting: false,
      }),
      columnHelper.display({
        header: t('myClasses.table.columns.status'),
        cell: (info) => {
          const classItem = info.row.original;
          return (
            <Badge variant={classItem.isActive ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
              {classItem.isActive ? t('myClasses.table.status.active') : t('myClasses.table.status.inactive')}
            </Badge>
          );
        },
        size: 120,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tCommon]
  );

  const table = useReactTable({
    data: displayClasses,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
  });

  return (
    <div className="w-full">
      <DataTable
        table={table}
        isLoading={isLoading}
        emptyState={<div className="text-muted-foreground">{t('myClasses.table.empty')}</div>}
        onClickRow={handleRowClick}
        rowStyle="cursor-pointer hover:bg-muted/50"
        showPagination={false}
      />
    </div>
  );
};
