import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '@ui/popover';
import { Bell } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar';
import { useState } from 'react';
import { useUnreadCount } from '@/features/notifications/hooks/useApi';
import { NotificationDropdown } from '@/features/notifications/components/NotificationDropdown';

const SidebarNotificationBell = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation.sidebar' });
  const [open, setOpen] = useState(false);
  const { data } = useUnreadCount();
  const unreadCount = data?.count ?? 0;

  return (
    <SidebarMenuItem>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <SidebarMenuButton size="sm" className="relative">
            <Bell />
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground absolute right-4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span>{t('notification')}</span>
          </SidebarMenuButton>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-0">
          <NotificationDropdown onClose={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
};

export default SidebarNotificationBell;
