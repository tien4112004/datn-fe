import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
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
    <Card
      className={cn(
        'relative cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-primary ring-2',
        pkg.popular && 'border-primary'
      )}
      onClick={() => onSelect(pkg)}
    >
      {pkg.popular && (
        <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold">
          {t('buyCoins.popular')}
        </div>
      )}
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <Coins className="size-10 text-yellow-500" />
        <div className="text-2xl font-bold">{pkg.coins}</div>
        <div className="text-muted-foreground text-sm">{t('buyCoins.coins')}</div>
        <div className="text-lg font-semibold">{formatVND(pkg.price)}</div>
        <Button
          variant={selected ? 'default' : 'outline'}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pkg);
          }}
        >
          {selected ? t('buyCoins.selected') : t('buyCoins.select')}
        </Button>
      </CardContent>
    </Card>
  );
}
