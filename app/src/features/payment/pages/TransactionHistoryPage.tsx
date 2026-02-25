import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { PageContainer } from '@/shared/components/common/PageContainer';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { CoinBalanceBadge } from '../components/CoinBalanceBadge';
import { useTransactions } from '../hooks/usePayment';
import { formatVND } from '../constants';
import type { TransactionStatus } from '../types';

export function TransactionHistoryPage() {
  const { t } = useTranslation('payment');
  const navigate = useNavigate();
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
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t('history.title')}
          description={t('history.subtitle')}
          onBack={() => navigate('/payment')}
          actions={<CoinBalanceBadge />}
        />

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
    </PageContainer>
  );
}
