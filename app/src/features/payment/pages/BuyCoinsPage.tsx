import { useState } from 'react';
import { Coins, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/context/auth';
import { CoinBalanceBadge } from '../components/CoinBalanceBadge';
import { CoinPackageCard } from '../components/CoinPackageCard';
import { GatewaySelector } from '../components/GatewaySelector';
import { useCreateCheckout } from '../hooks/usePayment';
import { COIN_PACKAGES, type CoinPackage } from '../constants';
import type { PaymentGate } from '../types';

export function BuyCoinsPage() {
  const { t } = useTranslation('payment');
  const { user } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage | null>(null);
  const [gate, setGate] = useState<PaymentGate>('SEPAY');
  const checkout = useCreateCheckout();

  const handleBuy = () => {
    if (!selectedPkg || !user) return;

    const origin = window.location.origin;

    checkout.mutate(
      {
        amount: selectedPkg.price,
        description: `Buy ${selectedPkg.coins} coins`,
        gate,
        successUrl: `${origin}/payment/success`,
        errorUrl: `${origin}/payment/error`,
        cancelUrl: `${origin}/payment/cancel`,
      },
      {
        onSuccess: (data) => {
          if (data.transactionId) {
            sessionStorage.setItem('pendingTransactionId', data.transactionId);
          }
          if (data.referenceCode) {
            sessionStorage.setItem('pendingReferenceCode', data.referenceCode);
          }

          if (data.gate === 'PAYOS') {
            window.location.href = data.checkoutUrl;
            return;
          }

          const formFields = data.formFields || {};
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.checkoutUrl;
          form.acceptCharset = 'UTF-8';
          form.style.display = 'none';

          Object.keys(formFields).forEach((key) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = formFields[key] == null ? '' : String(formFields[key]);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        },
      }
    );
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('buyCoins.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('buyCoins.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CoinBalanceBadge />
            <Button variant="outline" size="sm" asChild>
              <Link to="/payment/history">
                <History className="mr-1.5 size-4" />
                {t('buyCoins.history')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Coin Packages Grid */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t('buyCoins.selectPackage')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {COIN_PACKAGES.map((pkg) => (
              <CoinPackageCard
                key={pkg.id}
                pkg={pkg}
                selected={selectedPkg?.id === pkg.id}
                onSelect={setSelectedPkg}
              />
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-muted/30 space-y-6 rounded-lg border p-6">
          <GatewaySelector value={gate} onChange={setGate} />

          <div className="border-t pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                {selectedPkg ? (
                  <div className="flex items-center gap-2 text-lg">
                    <Coins className="size-5 text-yellow-500" />
                    <span className="font-semibold">
                      {selectedPkg.coins} {t('buyCoins.coins')}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                        selectedPkg.price
                      )}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{t('buyCoins.selectPackagePrompt')}</p>
                )}
              </div>
              <Button size="lg" disabled={!selectedPkg || checkout.isPending} onClick={handleBuy}>
                {checkout.isPending ? t('buyCoins.processing') : t('buyCoins.buyNow')}
              </Button>
            </div>

            {checkout.isError && (
              <p className="text-destructive mt-4 text-sm">{t('buyCoins.paymentFailed')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
