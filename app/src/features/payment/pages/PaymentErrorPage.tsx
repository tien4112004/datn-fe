import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function PaymentErrorPage() {
  const { t } = useTranslation('payment');

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <XCircle className="text-destructive mx-auto size-16" />
        <h1 className="text-2xl font-bold">{t('error.title')}</h1>
        <p className="text-muted-foreground">{t('error.message')}</p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/payment">{t('error.tryAgain')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">{t('error.goToDashboard')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
