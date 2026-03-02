import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/components/common/PageContainer';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { CoinBalanceBadge } from '../components/CoinBalanceBadge';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { useTransaction } from '../hooks/usePayment';
import { formatVND } from '../constants';
import type { TransactionStatus } from '../types';
import { format } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <span className="text-muted-foreground w-full shrink-0 text-sm sm:w-40">{label}</span>
      <span className="text-foreground break-all text-sm font-medium">{children}</span>
    </div>
  );
}

export function TransactionDetailPage() {
  const { t } = useTranslation('payment');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: transaction, isLoading, isError } = useTransaction(id);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd/MM/yyyy HH:mm:ss', { locale: getLocaleDateFns() });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={t('transactionDetail.title')}
          onBack={() => navigate('/payment/history')}
          actions={<CoinBalanceBadge />}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{t('transactionDetail.notFound')}</p>
          </div>
        )}

        {transaction && (
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="divide-y px-6">
              <DetailRow label={t('transactionDetail.id')}>
                <span className="font-mono">{transaction.id}</span>
              </DetailRow>

              <DetailRow label={t('transactionDetail.referenceCode')}>
                <span className="font-mono">{transaction.referenceCode || '—'}</span>
              </DetailRow>

              <DetailRow label={t('transactionDetail.description')}>
                {transaction.description || '—'}
              </DetailRow>

              <DetailRow label={t('transactionDetail.amount')}>
                <span className="text-base font-semibold">{formatVND(transaction.amount)}</span>
              </DetailRow>

              <DetailRow label={t('transactionDetail.gateway')}>{transaction.gate}</DetailRow>

              <DetailRow label={t('transactionDetail.status')}>
                <TransactionStatusBadge status={transaction.status as TransactionStatus} />
              </DetailRow>

              <DetailRow label={t('transactionDetail.createdAt')}>
                {formatDate(transaction.createdAt)}
              </DetailRow>

              <DetailRow label={t('transactionDetail.completedAt')}>
                {formatDate(transaction.completedAt)}
              </DetailRow>

              <DetailRow label={t('transactionDetail.updatedAt')}>
                {formatDate(transaction.updatedAt)}
              </DetailRow>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
