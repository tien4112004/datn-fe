import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfMonth,
  startOfYear,
  addDays,
  addMonths,
  addYears,
} from 'date-fns';
import { useAdminTransactions } from '@/hooks/useApi';
import { useRevenueByDate, useCostByDate } from '@/hooks/usePaymentApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { DateInput } from '@ui/date-input';
import { DataTable, TablePagination } from '@/components/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  type ChartConfig,
} from '@ui/chart';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionStatus, PaginatedTransactions } from '@/types/transaction';
import type { FinanceQueryParams } from '@/types/api';

const columnHelper = createColumnHelper<Transaction>();

type GroupBy = 'day' | 'month' | 'year';

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

const chartConfig: ChartConfig = {
  revenue: { label: 'Revenue (VND)', color: 'green' },
  cost: { label: 'Cost (VND)', color: 'red' },
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    amount
  );

function toApiDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

const MAX_DAYS = 30;

function getDefaultDateRange(groupBy: GroupBy): { start: Date; end: Date } {
  const today = new Date();
  if (groupBy === 'day') return { start: subDays(today, MAX_DAYS - 1), end: today };
  if (groupBy === 'month') return { start: startOfMonth(subMonths(today, 11)), end: today };
  return { start: startOfYear(subYears(today, 2)), end: today };
}

function aggregateByGroup(data: { date: string; totalAmount: number }[], groupBy: GroupBy) {
  const map = new Map<string, number>();
  for (const item of data) {
    const key =
      groupBy === 'day' ? item.date : groupBy === 'month' ? item.date.slice(0, 7) : item.date.slice(0, 4);
    map.set(key, (map.get(key) ?? 0) + item.totalAmount);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totalAmount]) => ({ date, totalAmount }));
}

function generateAllPeriods(start: Date, end: Date, groupBy: GroupBy): string[] {
  const periods: string[] = [];
  if (groupBy === 'day') {
    let cur = new Date(start);
    while (cur <= end) {
      periods.push(format(cur, 'yyyy-MM-dd'));
      cur = addDays(cur, 1);
    }
  } else if (groupBy === 'month') {
    let cur = startOfMonth(start);
    while (cur <= end) {
      periods.push(format(cur, 'yyyy-MM'));
      cur = addMonths(cur, 1);
    }
  } else {
    let cur = new Date(start.getFullYear(), 0, 1);
    while (cur.getFullYear() <= end.getFullYear()) {
      periods.push(String(cur.getFullYear()));
      cur = addYears(cur, 1);
    }
  }
  return periods;
}

function formatXAxisLabel(date: string, groupBy: GroupBy) {
  if (groupBy === 'day') return format(new Date(date + 'T00:00:00'), 'dd/MM');
  if (groupBy === 'month') return format(new Date(date + '-01T00:00:00'), 'MM/yyyy');
  return date;
}

export function TransactionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TransactionStatus | 'all'>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange('day'));
  const pageSize = 20;
  const today = new Date();

  const financeParams: FinanceQueryParams = {
    startDate: toApiDate(dateRange.start),
    endDate: toApiDate(dateRange.end),
  };

  const { data, isLoading, error } = useAdminTransactions({
    page,
    size: pageSize,
    status: status === 'all' ? undefined : status,
  });

  const { data: revenueData, isLoading: revenueLoading } = useRevenueByDate(financeParams);
  const { data: costData, isLoading: costLoading, error: costError } = useCostByDate(financeParams);

  const paginatedData = data?.data as PaginatedTransactions | undefined;
  const transactions: Transaction[] = paginatedData?.data ?? [];
  const pagination = paginatedData?.pagination;

  const costUnavailable = !!costError;
  const chartIsLoading = revenueLoading || (!costUnavailable && costLoading);

  const chartData = useMemo(() => {
    const rawRevenue = revenueData?.data ?? [];
    const rawCost = costUnavailable ? [] : (costData?.data ?? []);
    const aggRevenue = aggregateByGroup(rawRevenue, groupBy);
    const aggCost = aggregateByGroup(rawCost, groupBy);
    const revenueMap = new Map(aggRevenue.map((d) => [d.date, d.totalAmount]));
    const costMap = new Map(aggCost.map((d) => [d.date, d.totalAmount]));
    const allPeriods = generateAllPeriods(dateRange.start, dateRange.end, groupBy);
    return allPeriods.map((date) => ({
      date,
      label: formatXAxisLabel(date, groupBy),
      revenue: revenueMap.get(date) ?? 0,
      cost: (costMap.get(date) ?? 0) * 12.3,
    }));
  }, [revenueData, costData, costUnavailable, groupBy, dateRange]);

  const handleGroupByChange = (value: GroupBy) => {
    setGroupBy(value);
    setDateRange(getDefaultDateRange(value));
  };

  const columns = useMemo(
    () => [
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
        cell: (info) => <span className="font-mono font-medium">{formatVND(info.getValue())}</span>,
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
    state: { pagination: { pageIndex: page - 1, pageSize } },
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

      {/* Chart Card */}
      <div className="bg-card rounded-xl border py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4">
          <div>
            <p className="font-semibold leading-none">Revenue vs Cost</p>
            <p className="text-muted-foreground mt-1 text-sm">Money received from users vs token spend</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={groupBy} onValueChange={(v) => handleGroupByChange(v as GroupBy)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">By day</SelectItem>
                <SelectItem value="month">By month</SelectItem>
                <SelectItem value="year">By year</SelectItem>
              </SelectContent>
            </Select>
            <DateInput
              value={dateRange.start}
              onChange={(d) => {
                const newStart = d ?? getDefaultDateRange(groupBy).start;
                setDateRange((prev) => {
                  const end =
                    groupBy === 'day'
                      ? new Date(Math.min(prev.end.getTime(), addDays(newStart, MAX_DAYS - 1).getTime()))
                      : prev.end;
                  return { start: newStart, end };
                });
              }}
              maxDate={groupBy === 'day' ? subDays(dateRange.end, 0) : dateRange.end}
              fromYear={2020}
              toYear={today.getFullYear()}
              className="w-[140px]"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <DateInput
              value={dateRange.end}
              onChange={(d) => {
                const newEnd = d ?? today;
                setDateRange((prev) => {
                  const start =
                    groupBy === 'day'
                      ? new Date(Math.max(prev.start.getTime(), subDays(newEnd, MAX_DAYS - 1).getTime()))
                      : prev.start;
                  return { start, end: newEnd };
                });
              }}
              minDate={groupBy === 'day' ? addDays(dateRange.start, 0) : dateRange.start}
              maxDate={today}
              fromYear={2020}
              toYear={today.getFullYear()}
              className="w-[140px]"
            />
          </div>
        </div>

        {costUnavailable && (
          <p className="text-muted-foreground px-6 pb-3 text-xs">
            Cost unavailable — no exchange rate data in database yet
          </p>
        )}

        {chartIsLoading ? (
          <div className="flex h-48 items-center justify-center px-6">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center px-6">
            <p className="text-muted-foreground">No data for this period</p>
          </div>
        ) : (
          <div className="relative px-2 pb-2">
            <div
              className="pl-[56px] pr-2 [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: 'scroll', scrollbarWidth: 'none' }}
            >
              {/* <div style={{ width: chartWidth }}> */}
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground text-xs">
                              {name === 'revenue' ? 'Revenue' : 'Cost'}
                            </span>
                            <span className="font-mono font-medium">{formatVND(Number(value))}</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cost" fill="var(--color-cost)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
              {/* </div> */}
            </div>
            {/* Fixed YAxis overlay */}
            <div className="bg-card pointer-events-none absolute left-2 top-0 h-64 w-[56px]">
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}M`
                        : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}K`
                          : String(v)
                    }
                    width={56}
                  />
                  <Bar dataKey="revenue" fill="transparent" />
                  <Bar dataKey="cost" fill="transparent" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
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
