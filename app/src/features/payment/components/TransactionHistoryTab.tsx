import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import DataTable from '@/shared/components/table/DataTable';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { useTransactions } from '../hooks/usePayment';
import { formatVND } from '../constants';
import type { TransactionDetails, TransactionStatus } from '../types';

const columnHelper = createColumnHelper<TransactionDetails>();

export function TransactionHistoryTab() {
  const { t } = useTranslation('payment');
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: txData, isLoading } = useTransactions(pagination.pageIndex + 1, pagination.pageSize);

  const transactions = useMemo(() => txData?.data ?? [], [txData]);
  const totalItems = txData?.pagination?.totalItems ?? 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        header: t('history.date'),
        cell: (info) =>
          format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm', {
            locale: getLocaleDateFns(),
          }),
        size: 180,
      }),
      columnHelper.accessor('description', {
        header: t('history.description'),
        cell: (info) => info.getValue(),
        minSize: 200,
        meta: { isGrow: true },
      }),
      columnHelper.accessor('amount', {
        header: t('history.amount'),
        cell: (info) => <span className="font-medium">{formatVND(info.getValue())}</span>,
        size: 150,
      }),
      columnHelper.accessor('gate', {
        header: t('history.gateway'),
        cell: (info) => info.getValue(),
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: t('history.status'),
        cell: (info) => <TransactionStatusBadge status={info.getValue() as TransactionStatus} />,
        size: 130,
      }),
    ],
    [t]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableSorting: false,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    state: {
      pagination,
    },
    rowCount: totalItems,
    onPaginationChange: setPagination as any as (updaterOrValue: Updater<PaginationState>) => void,
  });

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      onClickRow={(row) => navigate(`/payment/transaction/${row.original.id}`)}
      rowStyle="transition cursor-pointer"
      emptyState={<div className="text-muted-foreground">{t('history.noTransactions')}</div>}
    />
  );
}
