import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PresentationItem } from '../types/presentation';
import { Badge } from '@/components/ui/badge';
import ActionButton from './ActionButton';
import { usePresentations } from '../hooks/useApi';
import DataTable from '@/components/table/DataTable';

const PresentationTable = () => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper<PresentationItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('presentation.table.id'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('title', {
        header: t('presentation.table.title'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: t('presentation.table.description'),
        cell: (info) => <i>{info.getValue()}</i>,
        enableSorting: false,
      }),
      columnHelper.accessor('createdAt', {
        header: t('presentation.table.createdAt'),
        cell: (info) => info.renderValue(),
      }),
      columnHelper.accessor('status', {
        header: t('presentation.table.status'),
        cell: (info) => (
          <Badge variant={info.getValue() === 'active' ? 'default' : 'outline'} className="text-sm">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: t('table.actions'),
        cell: (info) => (
          <ActionButton
            onEdit={() => {
              console.log('Edit: ', info.row.original.id);
            }}
            onDelete={() => {
              console.log('Delete: ', info.row.original.id);
            }}
          />
        ),
        meta: {
          style: {
            align: 'center',
          },
        },
      }),
    ],
    [t]
  );

  const { presentationItems } = usePresentations();

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

  return <DataTable table={table} />;
};

export default PresentationTable;
