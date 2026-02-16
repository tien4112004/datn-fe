import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
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
        {isLoading || !isFinal ? (
          <>
            <Loader2 className="text-primary mx-auto size-16 animate-spin" />
            <h1 className="text-2xl font-bold">{t('success.processing')}</h1>
            <p className="text-muted-foreground">{t('success.processingMessage')}</p>
          </>
        ) : transaction.status === 'COMPLETED' ? (
          <>
            <CheckCircle className="mx-auto size-16 text-green-500" />
            <h1 className="text-2xl font-bold">{t('success.title')}</h1>
            <p className="text-muted-foreground">{t('success.message')}</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-yellow-100">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-bold">{t('success.statusTitle')}</h1>
          </>
        )}

        {transaction && (
          <div className="space-y-2 rounded-lg border p-4 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('history.amount')}</span>
              <span className="font-medium">{formatVND(transaction.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('history.status')}</span>
              <TransactionStatusBadge status={transaction.status} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('history.gateway')}</span>
              <span>{transaction.gate}</span>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
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
