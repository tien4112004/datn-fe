import * as React from 'react';
import { Bell, Command, Database, File, Home, Users, Grid3x3, ClipboardList } from 'lucide-react';
import { NavMain } from '@/shared/components/navigation/NavMain';
import { NavSecondary } from '@/shared/components/navigation/NavSecondary';
import { NavUser } from '@/shared/components/navigation/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/shared/components/ui/sidebar';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation('common', { keyPrefix: 'navigation.sidebar' });
  const { user } = useAuth();

  const data = {
    user: {
      name: user?.name || user?.firstName + ' ' + user?.lastName || 'User',
      email: user?.email || 'user@example.com',
      avatar: user?.avatar || '',
    },
    navMain: [
      {
        title: t('home'),
        url: '/',
        icon: Home,
      },
      {
        title: t('projects'),
        url: '/projects',
        icon: File,
      },
      {
        title: t('classes'),
        url: '/classes',
        icon: Users,
      },
      {
        title: t('assignments'),
        url: '/assignments/create',
        icon: ClipboardList,
      },
      {
        title: t('questionBank'),
        url: '/question-bank',
        icon: Database,
      },
      {
        title: t('assessmentMatrix'),
        url: '/assessment-matrix/builder',
        icon: Grid3x3,
      },
    ],
    navSecondary: [
      {
        title: t('notification'),
        url: '/notification',
        icon: Bell,
      },
      {
        title: t('questionRendererDemo'),
        url: '/demo/question-renderer',
        icon: Grid3x3,
      },
    ],
  };

  return (
    <Sidebar variant="inset" collapsible="lg-icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="outline-hidden ring-sidebar-ring group-data-[collapsible=lg-icon]:h-14! my-auto flex h-12 w-full flex-row items-center justify-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-[width,height,padding] group-data-[collapsible=lg-icon]:flex-col group-data-[collapsible=lg-icon]:text-xs [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Command className="size-4" />
                <div className="absolute opacity-0 transition-opacity hover:opacity-100 group-data-[state=expanded]:hidden">
                  <SidebarTrigger className="size-8" />
                </div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=lg-icon]:hidden">
                <span className="truncate font-medium">PrimaryToolbox</span>
                <span className="truncate text-xs">{t('slogan')}</span>
              </div>
              <SidebarTrigger className="group-data-[collapsible=lg-icon]:hidden" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
