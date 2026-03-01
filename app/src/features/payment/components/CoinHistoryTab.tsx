import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';
import { cn } from '@/shared/lib/utils';
import DataTable from '@/shared/components/table/DataTable';
import { useAuth } from '@/shared/context/auth';
import { useCoinHistory } from '../hooks/usePayment';
import { getCoinTypeLabelKey, getCoinSourceLabelKey } from '../constants';
import type { CoinUsageTransaction } from '../types';

const columnHelper = createColumnHelper<CoinUsageTransaction>();

export function CoinHistoryTab() {
  const { t } = useTranslation('payment');
  const { user } = useAuth();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: coinData, isLoading } = useCoinHistory(user?.id, pagination.pageIndex, pagination.pageSize);

  const coinHistory = useMemo(() => coinData?.data ?? [], [coinData]);
  const totalItems = coinData?.pagination?.totalItems ?? 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        header: t('coinHistory.date'),
        cell: (info) =>
          format(new Date(info.getValue()), 'dd/MM/yyyy HH:mm', {
            locale: getLocaleDateFns(),
          }),
        size: 180,
      }),
      columnHelper.accessor('type', {
        header: t('coinHistory.type'),
        cell: (info) => {
          const type = info.getValue();
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                type === 'add' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
            >
              {t(getCoinTypeLabelKey(type) as never)}
            </span>
          );
        },
        size: 120,
      }),
      columnHelper.accessor('source', {
        header: t('coinHistory.source'),
        cell: (info) => t(getCoinSourceLabelKey(info.getValue()) as never),
        minSize: 150,
        meta: { isGrow: true },
      }),
      columnHelper.accessor('amount', {
        header: t('coinHistory.amount'),
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className={cn('font-medium', row.type === 'add' ? 'text-green-600' : 'text-red-600')}>
              {row.type === 'add' ? '+' : '-'}
              {info.getValue()}
            </span>
          );
        },
        size: 100,
      }),
    ],
    [t]
  );

  const table = useReactTable({
    data: coinHistory,
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
      emptyState={<div className="text-muted-foreground">{t('coinHistory.noHistory')}</div>}
    />
  );
}
