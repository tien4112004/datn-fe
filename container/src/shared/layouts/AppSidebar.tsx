import * as React from "react"
import {
  Bell,
  BookOpen,
  Bot,
  Command,
  File,
  Frame,
  Home,
  Map,
  PieChart,
  Plus,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/shared/components/navigation/NavMain"
import { NavSubjects } from "@/shared/components/navigation/NavSubjects"
import { NavSecondary } from "@/shared/components/navigation/NavSecondary"
import { NavUser } from "@/shared/components/navigation/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { useTranslation } from "react-i18next"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation('navSidebar');

  const data = {
    user: {
      name: "Boss",
      email: "luuthaiton@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t('home'),
        url: "/",
        icon: Home,
      },
      {
        title: t('create'),
        url: "#",
        icon: Plus,
      },
      {
        title: t('resources.index'),
        icon: File,
        url: "#", 
        items: [
          {
            title: t('resources.files'),
            url: "#",
          },
          {
            title: t('resources.presentations'),
            url: "/presentation",
          },
          {
            title: t('resources.lectures'),
            url: "#",
          },
          {
            title: t('resources.exercises'),
            url: "#",
          },
          {
            title: t('resources.videos'),
            url: "#",
          },
          {
            title: t('resources.images'),
            url: "#",
          },
          {
            title: t('resources.mindmaps'),
            url: "#",
          },
        ],
      },
      {
        title: t('classroom.index'),
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: t('classroom.classes'),
            url: "#",
          },
          {
            title: t('classroom.groups'),
            url: "#",
          },
          {
            title: t('classroom.subjects'),
            url: "#",
          },
          {
            title: t('classroom.schedules'),
            url: "#",
          },
        ],
      },
      {
        title: t('settings'),
        url: "#",
        icon: Settings2,
      },
    ],
    navSecondary: [
      {
        title: t('notification'),
        url: "#",
        icon: Bell,
      },
    ],
    subjects: [
      {
        name: t('subjects.math'),
        url: "#",
      },
      {
        name: t('subjects.vietnamese'),
        url: "#",
      },
      {
        name: t('subjects.english'),
        url: "#",
      },
    ],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
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
        <NavSubjects subjects={data.subjects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
