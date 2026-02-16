'use client';

import {
  BadgeCheck,
  Check,
  ChevronsUpDown,
  CreditCard,
  Languages,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/components/ui/sidebar';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { UserAvatar } from '../common/UserAvatar';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { t, i18n } = useTranslation(I18N_NAMESPACES.AUTH);

  const changeLanguage = (code: string) => {
    if (code !== i18n.language) i18n.changeLanguage(code);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const handleLogout = async () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success(t('logout.success'));
        navigate('/login');
      },
      onError: () => {
        // Even if backend logout fails, frontend session is cleared
        // Still show success and redirect to login
        toast.success(t('logout.success'));
        navigate('/login');
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar className="h-8 w-8 rounded-lg" src={user.avatar} name={user.name} />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=lg-icon]:hidden">
                <span className="truncate font-medium">{user.name || 'No Name'}</span>
                <span className="truncate text-xs">{user.email || 'No Email'}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=lg-icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar className="h-10 w-10 rounded-lg" src={user.avatar} name={user.name} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name || 'No Name'}</span>
                  <span className="truncate text-xs">{user.email || 'No Email'}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <NavLink to="/profile">
                  <BadgeCheck />
                  Account
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/payment">
                  <CreditCard />
                  Billing
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/settings">
                  <Settings />
                  Settings
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages />
                  Language
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem key={lang.code} onClick={() => changeLanguage(lang.code)}>
                        <span className="text-lg leading-none">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {i18n.language === lang.code && <Check className="ml-auto size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
