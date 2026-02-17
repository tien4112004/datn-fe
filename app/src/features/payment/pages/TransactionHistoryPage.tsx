import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { CoinBalanceBadge } from '../components/CoinBalanceBadge';
import { useTransactions } from '../hooks/usePayment';
import { formatVND } from '../constants';
import type { TransactionStatus } from '../types';

export function TransactionHistoryPage() {
  const { t } = useTranslation('payment');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading } = useTransactions(page, pageSize);

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/payment">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('history.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('history.subtitle')}</p>
            </div>
          </div>
          <CoinBalanceBadge />
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('history.date')}</TableHead>
                <TableHead>{t('history.description')}</TableHead>
                <TableHead>{t('history.amount')}</TableHead>
                <TableHead>{t('history.gateway')}</TableHead>
                <TableHead>{t('history.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    {t('history.loading')}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    {t('history.noTransactions')}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell className="text-sm">{tx.description}</TableCell>
                    <TableCell className="text-sm font-medium">{formatVND(tx.amount)}</TableCell>
                    <TableCell className="text-sm">{tx.gate}</TableCell>
                    <TableCell>
                      <TransactionStatusBadge status={tx.status as TransactionStatus} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t('history.previous')}
            </Button>
            <span className="text-muted-foreground text-sm">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('history.next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
