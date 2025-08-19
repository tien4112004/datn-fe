import * as React from 'react';
import { Bell, BookOpen, CalendarDays, Command, File, FolderClosed, Home, Users } from 'lucide-react';

import { NavMain } from '@/shared/components/navigation/NavMain';
// import { NavSubjects } from '@/shared/components/navigation/NavSubjects';
import { NavSecondary } from '@/shared/components/navigation/NavSecondary';
import { NavUser } from '@/shared/components/navigation/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation('navSidebar');

  const data = {
    user: {
      name: 'Boss',
      email: 'luuthaiton@example.com',
      avatar: '',
    },
    navMain: [
      {
        title: t('home'),
        url: '/',
        icon: Home,
      },
      {
        title: t('projects'),
        url: '/presentation',
        icon: File,
      },
      {
        title: t('files'),
        url: '#',
        icon: FolderClosed,
      },
      {
        title: t('classes'),
        url: '#',
        icon: Users,
      },
      {
        title: t('subjects'),
        url: '#',
        icon: BookOpen,
      },
      {
        title: t('schedules'),
        url: '#',
        icon: CalendarDays,
      },
    ],
    navSecondary: [
      {
        title: t('notification'),
        url: '#',
        icon: Bell,
      },
    ],
    subjects: [
      {
        name: t('subjects.math'),
        url: '#',
      },
      {
        name: t('subjects.vietnamese'),
        url: '#',
      },
      {
        name: t('subjects.english'),
        url: '#',
      },
    ],
  };

  return (
    <Sidebar variant="inset" collapsible="lg-icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=lg-icon]:hidden">
                  <span className="truncate font-medium">PrimaryToolbox</span>
                  <span className="truncate text-xs">{t('slogan')}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSubjects subjects={data.subjects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
