import { Coins } from 'lucide-react';
import { useAuth } from '@/shared/context/auth';
import { useCoinBalance } from '../hooks/usePayment';
import { cn } from '@/shared/lib/utils';

interface CoinBalanceBadgeProps {
  className?: string;
}

export function CoinBalanceBadge({ className }: CoinBalanceBadgeProps) {
  const { user } = useAuth();
  const { data } = useCoinBalance(user?.id);

  const coins = data?.coin ?? 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700',
        className
      )}
    >
      <Coins className="size-4" />
      <span>{coins.toLocaleString()}</span>
    </div>
  );
}
