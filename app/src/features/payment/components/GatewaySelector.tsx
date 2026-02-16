import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import type { PaymentGate } from '../types';

interface GatewaySelectorProps {
  value: PaymentGate;
  onChange: (gate: PaymentGate) => void;
}

export function GatewaySelector({ value, onChange }: GatewaySelectorProps) {
  const { t } = useTranslation('payment');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('buyCoins.paymentMethod')}</label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as PaymentGate)} className="flex gap-6">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="SEPAY" id="gate-sepay" />
          <Label htmlFor="gate-sepay" className="cursor-pointer">
            {t('buyCoins.sepay')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="PAYOS" id="gate-payos" />
          <Label htmlFor="gate-payos" className="cursor-pointer">
            {t('buyCoins.payos')}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
