import { Coins } from 'lucide-react';
import { SidebarMenuItem, useSidebar } from '@/shared/components/ui/sidebar';
import { useAuth } from '@/shared/context/auth';
import { useCoinBalance } from '@/features/payment/hooks/usePayment';
import { cn } from '@/shared/lib/utils';

const SidebarCoinBalance = () => {
  const { user } = useAuth();
  const { data } = useCoinBalance(user?.id);
  const { state } = useSidebar();

  const coins = data?.coin ?? 0;
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenuItem>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-md bg-yellow-50 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
          isCollapsed ? 'flex-col px-2 py-2 group-data-[collapsible=lg-icon]:gap-1' : 'flex-row px-3 py-1.5'
        )}
      >
        <Coins className={cn('shrink-0', isCollapsed ? 'size-5' : 'size-4')} />
        <span className={cn('truncate', isCollapsed && 'group-data-[collapsible=lg-icon]:text-[10px]')}>
          {coins.toLocaleString()}
        </span>
      </div>
    </SidebarMenuItem>
  );
};

export default SidebarCoinBalance;
