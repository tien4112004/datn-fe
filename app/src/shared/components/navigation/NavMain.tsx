import { type LucideIcon } from 'lucide-react';

import { Collapsible } from '@ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
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
  if (items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
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
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
