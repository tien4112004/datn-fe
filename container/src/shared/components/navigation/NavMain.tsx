'use client';

import {
  // ChevronRight,
  type LucideIcon,
} from 'lucide-react';

import {
  Collapsible,
  // CollapsibleContent,
  // CollapsibleTrigger
} from '@/shared/components/ui/collapsible';
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  // SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
} from '@/shared/components/ui/sidebar';
// import { useTranslation } from 'react-i18next';
import { NavLink, type NavLinkRenderProps } from 'react-router-dom';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon: LucideIcon;
    isExpanded?: boolean;
    url: string;
  }[];
}) {
  // const { t } = useTranslation('navSidebar');

  if (items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>{t('features')}</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isExpanded}>
            <SidebarMenuItem>
              <NavLink to={item.url} asChild>
                {({ isActive }: NavLinkRenderProps) => (
                  <SidebarMenuButton isActive={isActive}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className="group">
                    <item.icon />
                    <span>{item.title}</span>
                    <SidebarMenuAction>
                      <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <NavLink to={subItem.url}>
                            <span>{subItem.title}</span>
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem> */}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
