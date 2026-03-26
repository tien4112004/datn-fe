import { Coins, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { CoinPackage } from '../constants';
import { formatVND } from '../constants';

interface CoinPackageCardProps {
  pkg: CoinPackage;
  selected: boolean;
  onSelect: (pkg: CoinPackage) => void;
  className?: string;
}

function formatPackageName(name: string): string {
  // "BASIC_20K" → "Basic", "ULTIMATE_500K" → "Ultimate"
  return name.split('_')[0].charAt(0).toUpperCase() + name.split('_')[0].slice(1).toLowerCase();
}

export function CoinPackageCard({ pkg, selected, onSelect, className }: CoinPackageCardProps) {
  const { t } = useTranslation('payment');
  const hasBonus = pkg.bonus > 0;

  return (
    <button
      type="button"
      className={cn(
        'hover:border-primary/50 relative flex flex-col items-center gap-3 rounded-lg border-2 p-5 transition-all hover:shadow-sm',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-background',
        hasBonus && !selected && 'border-primary/30',
        className
      )}
      onClick={() => onSelect(pkg)}
    >
      {hasBonus && (
        <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-semibold">
          {t('buyCoins.bonus', { coins: pkg.bonus })}
        </div>
      )}
      {selected && (
        <div className="bg-primary absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full">
          <Check className="text-primary-foreground size-4" />
        </div>
      )}
      <div className="text-base font-bold">{formatPackageName(pkg.name)}</div>
      <Coins className="size-8 text-yellow-500" />
      <div className="text-2xl font-bold">{pkg.coin}</div>
      <div className="text-muted-foreground text-xs">{t('buyCoins.coins')}</div>
      <div className="text-sm font-semibold">{formatVND(pkg.price)}</div>
    </button>
  );
}
