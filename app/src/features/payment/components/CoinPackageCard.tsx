import { Coins, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { CoinPackage } from '../constants';
import { formatVND } from '../constants';

interface CoinPackageCardProps {
  pkg: CoinPackage;
  selected: boolean;
  onSelect: (pkg: CoinPackage) => void;
}

export function CoinPackageCard({ pkg, selected, onSelect }: CoinPackageCardProps) {
  const { t } = useTranslation('payment');

  return (
    <button
      type="button"
      className={cn(
        'hover:border-primary/50 relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:shadow-sm',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-background',
        pkg.popular && !selected && 'border-primary/30'
      )}
      onClick={() => onSelect(pkg)}
    >
      {pkg.popular && (
        <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold">
          {t('buyCoins.popular')}
        </div>
      )}
      {selected && (
        <div className="bg-primary absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full">
          <Check className="text-primary-foreground size-4" />
        </div>
      )}
      <Coins className="size-10 text-yellow-500" />
      <div className="text-2xl font-bold">{pkg.coins}</div>
      <div className="text-muted-foreground text-sm">{t('buyCoins.coins')}</div>
      <div className="text-lg font-semibold">{formatVND(pkg.price)}</div>
    </button>
  );
}
