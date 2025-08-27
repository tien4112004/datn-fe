import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PresentationItem } from '../../types/presentation';
import { usePresentations } from '../../hooks/useApi';
import DataTable from '@/components/table/DataTable';
import { ActionContent } from './ActionButton';

const PresentationTableV2 = () => {
  const { t } = useTranslation('table');
  const columnHelper = createColumnHelper<PresentationItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('presentation.id'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('title', {
        header: t('presentation.title'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('createdAt', {
        header: t('presentation.createdAt'),
        cell: (info) => {
          const date = info.getValue();
          if (!date) return '';
          return new Date(date).toLocaleDateString();
        },
      }),
      columnHelper.accessor('updatedAt', {
        header: t('presentation.updatedAt'),
        cell: (info) => {
          const date = info.getValue();
          if (!date) return '';
          return new Date(date).toLocaleDateString();
        },
      }),
    ],
    [t]
  );

  const { presentationItems, isLoading } = usePresentations();

  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);

  useEffect(() => {
    console.log('Sorting changed:', sorting);
  }, [sorting]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    console.log('Pagination changed:', pagination);
  }, [pagination]);

  const table = useReactTable({
    data: presentationItems || [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      emptyState={<div className="text-muted-foreground">{t('presentation.emptyState')}</div>}
      contextMenu={(row) => (
        <ActionContent
          onEdit={() => {
            console.log('Edit', row.original);
          }}
          onDelete={() => {
            console.log('Delete', row.original);
          }}
        />
      )}
    />
  );
};

export default PresentationTableV2;
