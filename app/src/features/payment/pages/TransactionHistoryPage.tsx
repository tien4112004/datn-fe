import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { PageContainer } from '@/shared/components/common/PageContainer';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/context/auth';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { CoinBalanceBadge } from '../components/CoinBalanceBadge';
import { useTransactions, useCoinHistory } from '../hooks/usePayment';
import { formatVND, getCoinTypeLabelKey, getCoinSourceLabelKey } from '../constants';
import type { TransactionStatus } from '../types';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

type Tab = 'transactions' | 'coinHistory';

export function TransactionHistoryPage() {
  const { t } = useTranslation('payment');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('transactions');

  // Transaction history state
  const [txPage, setTxPage] = useState(1);
  const { data: txData, isLoading: isTxLoading } = useTransactions(txPage, 10);
  const transactions = txData?.data ?? [];
  const txPagination = txData?.pagination;

  // Coin usage history state
  const [coinPage, setCoinPage] = useState(0);
  const { data: coinData, isLoading: isCoinLoading } = useCoinHistory(user?.id, coinPage, 10);
  const coinHistory = coinData?.data ?? [];
  const coinPagination = coinData?.pagination;

  const formatDate = (dateStr: string | null) => {
    return format(new Date(dateStr || ''), 'dd/MM/yyyy HH:mm', { locale: getLocaleDateFns() });
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: 'transactions', label: t('coinHistory.tabTransactions') },
    { value: 'coinHistory', label: t('coinHistory.tabCoinHistory') },
  ];

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

        {/* Tab Buttons */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
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
                  {isTxLoading ? (
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
                      <TableRow
                        key={tx.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/payment/transaction/${tx.id}`)}
                      >
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

            {txPagination && txPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => p - 1)}
                >
                  {t('history.previous')}
                </Button>
                <span className="text-muted-foreground text-sm">
                  {txPagination.currentPage} / {txPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage >= txPagination.totalPages}
                  onClick={() => setTxPage((p) => p + 1)}
                >
                  {t('history.next')}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Coin Usage Tab */}
        {activeTab === 'coinHistory' && (
          <>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('coinHistory.date')}</TableHead>
                    <TableHead>{t('coinHistory.type')}</TableHead>
                    <TableHead>{t('coinHistory.source')}</TableHead>
                    <TableHead>{t('coinHistory.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isCoinLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                        {t('coinHistory.loading')}
                      </TableCell>
                    </TableRow>
                  ) : coinHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                        {t('coinHistory.noHistory')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    coinHistory.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{formatDate(tx.createdAt)}</TableCell>
                        <TableCell className="text-sm">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                              tx.type === 'add' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            )}
                          >
                            {t(getCoinTypeLabelKey(tx.type) as never)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {t(getCoinSourceLabelKey(tx.source) as never)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-sm font-medium',
                            tx.type === 'add' ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {tx.type === 'add' ? '+' : '-'}
                          {tx.amount}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {coinPagination && coinPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={coinPage <= 0}
                  onClick={() => setCoinPage((p) => p - 1)}
                >
                  {t('coinHistory.previous')}
                </Button>
                <span className="text-muted-foreground text-sm">
                  {coinPage + 1} / {coinPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={coinPage + 1 >= coinPagination.totalPages}
                  onClick={() => setCoinPage((p) => p + 1)}
                >
                  {t('coinHistory.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
