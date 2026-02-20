import { Coins } from 'lucide-react';
import { SidebarMenuItem } from '@/shared/components/ui/sidebar';
import { useAuth } from '@/shared/context/auth';
import { useCoinBalance } from '@/features/payment/hooks/usePayment';

const SidebarCoinBalance = () => {
  const { user } = useAuth();
  const { data } = useCoinBalance(user?.id);

  const coins = data?.coin ?? 0;

  return (
    <SidebarMenuItem>
      <div className="flex flex-col items-center gap-1 rounded-md bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
        <Coins className="size-4 shrink-0" />
        <span className="truncate">{coins.toLocaleString()}</span>
      </div>
    </SidebarMenuItem>
  );
};

export default SidebarCoinBalance;
