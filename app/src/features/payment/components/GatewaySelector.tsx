import { useTranslation } from 'react-i18next';
import { CreditCard, Landmark } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PaymentGate } from '../types';

interface GatewaySelectorProps {
  value: PaymentGate;
  onChange: (gate: PaymentGate) => void;
}

const PAYMENT_GATEWAYS = [
  { id: 'SEPAY' as const, icon: Landmark, labelKey: 'buyCoins.sepay' },
  { id: 'PAYOS' as const, icon: CreditCard, labelKey: 'buyCoins.payos' },
];

export function GatewaySelector({ value, onChange }: GatewaySelectorProps) {
  const { t } = useTranslation('payment');

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{t('buyCoins.paymentMethod')}</label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PAYMENT_GATEWAYS.map((gateway) => {
          const Icon = gateway.icon;
          const isSelected = value === gateway.id;
          return (
            <button
              key={gateway.id}
              type="button"
              onClick={() => onChange(gateway.id)}
              className={cn(
                'hover:border-primary/50 flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background'
              )}
            >
              <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>
                {t(gateway.labelKey as never)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
