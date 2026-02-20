import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@ui/button';
import { useTransaction } from '../hooks/usePayment';
import { TransactionStatusBadge } from '../components/TransactionStatusBadge';
import { formatVND } from '../constants';

export function PaymentSuccessPage() {
  const { t } = useTranslation('payment');
  const [searchParams] = useSearchParams();

  const transactionId = searchParams.get('transactionId') ?? sessionStorage.getItem('pendingTransactionId');

  const { data: transaction, isLoading } = useTransaction(transactionId ?? undefined);

  const isFinal =
    transaction && ['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(transaction.status);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Status Icon & Message */}
        {isLoading || !isFinal ? (
          <>
            <Loader2 className="text-primary mx-auto size-16 animate-spin" />
            <div>
              <h1 className="text-2xl font-bold">{t('success.processing')}</h1>
              <p className="text-muted-foreground mt-2">{t('success.processingMessage')}</p>
            </div>
          </>
        ) : transaction.status === 'COMPLETED' ? (
          <>
            <CheckCircle className="mx-auto size-16 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold">{t('success.title')}</h1>
              <p className="text-muted-foreground mt-2">{t('success.message')}</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto size-16 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold">{t('success.statusTitle')}</h1>
            </div>
          </>
        )}

        {/* Transaction Details */}
        {transaction && (
          <div className="bg-muted/30 space-y-3 rounded-lg border p-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('history.amount')}</span>
              <span className="font-medium">{formatVND(transaction.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('history.status')}</span>
              <TransactionStatusBadge status={transaction.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('history.gateway')}</span>
              <span className="font-medium">{transaction.gate}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">{t('success.goToDashboard')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/payment">{t('success.buyMore')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
