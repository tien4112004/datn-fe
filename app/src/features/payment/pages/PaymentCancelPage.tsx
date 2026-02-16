import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Ban } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function PaymentCancelPage() {
  const { t } = useTranslation('payment');

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <Ban className="text-muted-foreground mx-auto size-16" />
        <h1 className="text-2xl font-bold">{t('cancel.title')}</h1>
        <p className="text-muted-foreground">{t('cancel.message')}</p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/payment">{t('cancel.backToCoins')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">{t('cancel.goToDashboard')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
