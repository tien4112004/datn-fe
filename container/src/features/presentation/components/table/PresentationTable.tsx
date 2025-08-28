import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PresentationItem } from '../../types/presentation';
import { usePresentations } from '../../hooks/useApi';
import DataTable from '@/components/table/DataTable';
import { ActionContent } from './ActionButton';
import { useNavigate } from 'react-router-dom';

const PresentationTable = () => {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<PresentationItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('presentation.id'),
        cell: (info) => info.getValue(),
        size: 50,
        enableResizing: false,
      }),
      columnHelper.accessor('thumbnail', {
        header: t('presentation.thumbnail'),
        cell: () => <img src="https://placehold.co/600x400" alt="" className="h-16 w-16 object-cover" />,
        size: 100,
        enableResizing: false,
      }),
      columnHelper.accessor('title', {
        header: t('presentation.title'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: {
          isGrow: true,
        },
      }),
      columnHelper.accessor('createdAt', {
        header: t('presentation.createdAt'),
        cell: (info) => {
          const date = info.getValue();
          if (!date) return '';
          return new Date(date).toLocaleDateString();
        },
        size: 120,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('presentation.updatedAt'),
        cell: (info) => {
          const date = info.getValue();
          if (!date) return '';
          return new Date(date).toLocaleDateString();
        },
        size: 120,
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
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
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
          onViewDetail={() => {
            navigate(`/presentation/${row.original.id}`);
          }}
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

export default PresentationTable;
