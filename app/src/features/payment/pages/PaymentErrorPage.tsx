import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { Button } from '@ui/button';
import { PageHeader } from '@/shared/components/common/PageHeader';

export function PaymentErrorPage() {
  const { t } = useTranslation('payment');

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <XCircle className="text-destructive mx-auto size-16" />
        <PageHeader title={t('error.title')} description={t('error.message')} />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/payment">{t('error.tryAgain')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">{t('error.goToDashboard')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
