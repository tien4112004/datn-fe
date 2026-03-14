import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useAdminTransactions } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { DataTable, TablePagination } from '@/components/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionStatus, PaginatedTransactions } from '@/types/transaction';

const columnHelper = createColumnHelper<Transaction>();

const STATUS_OPTIONS: { label: string; value: TransactionStatus | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

const STATUS_STYLES: Record<TransactionStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  REFUNDED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    amount
  );

export function TransactionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TransactionStatus | 'all'>('all');
  const pageSize = 20;

  const { data, isLoading, error } = useAdminTransactions({
    page,
    size: pageSize,
    status: status === 'all' ? undefined : status,
  });

  const paginatedData = data?.data as PaginatedTransactions | undefined;
  const transactions: Transaction[] = paginatedData?.data ?? [];
  const pagination = paginatedData?.pagination;

  const columns = useMemo(
    () => [
      columnHelper.accessor('referenceCode', {
        header: 'Reference',
        cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('userId', {
        header: 'User ID',
        cell: (info) => (
          <button
            className="text-primary max-w-[120px] truncate text-xs hover:underline"
            title={info.getValue()}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${info.getValue()}`);
            }}
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => <span className="font-medium">{formatVND(info.getValue())}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue() as TransactionStatus;
          return (
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[s] ?? '')}>
              {s}
            </span>
          );
        },
      }),
      columnHelper.accessor('gate', {
        header: 'Gateway',
        cell: (info) => <span className="text-muted-foreground text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => (
          <span className="text-muted-foreground max-w-[200px] truncate text-xs" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('completedAt', {
        header: 'Completed',
        cell: (info) => {
          const v = info.getValue();
          return v ? (
            <span className="text-xs">{format(new Date(v), 'MMM d, yyyy HH:mm')}</span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <span className="text-xs">{format(new Date(info.getValue()), 'MMM d, yyyy HH:mm')}</span>
        ),
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    state: {
      pagination: { pageIndex: page - 1, pageSize },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">All payment transactions across users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction history</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.totalItems.toLocaleString()} total transactions` : 'Loading...'}
              </CardDescription>
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as TransactionStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive">Failed to load transactions</p>
            </div>
          ) : (
            <>
              <DataTable
                table={table}
                isLoading={isLoading}
                emptyState={<span className="text-muted-foreground">No transactions found</span>}
              />
              {pagination && pagination.totalPages > 1 && (
                <TablePagination table={table} totalItems={pagination.totalItems} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
