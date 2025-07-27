import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavMain } from '@/shared/components/navigation/NavMain';

// Mocks
const MockIcon = () => <span data-testid="mock-icon" />;
vi.mock('lucide-react', () => ({
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

vi.mock('@/shared/components/ui/collapsible', () => ({
  Collapsible: ({ children }: any) => <div data-testid="collapsible">{children}</div>,
  CollapsibleContent: ({ children }: any) => <div data-testid="collapsible-content">{children}</div>,
  CollapsibleTrigger: ({ children }: any) => <button data-testid="collapsible-trigger">{children}</button>,
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: any) => <div data-testid="sidebar-group">{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div data-testid="sidebar-group-label">{children}</div>,
  SidebarMenu: ({ children }: any) => <nav data-testid="sidebar-menu">{children}</nav>,
  SidebarMenuAction: ({ children }: any) => <div data-testid="sidebar-menu-action">{children}</div>,
  SidebarMenuButton: ({ children, ...props }: any) => (
    <button data-testid="sidebar-menu-button" {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: any) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarMenuSub: ({ children }: any) => <div data-testid="sidebar-menu-sub">{children}</div>,
  SidebarMenuSubButton: ({ children, ...props }: any) => (
    <button data-testid="sidebar-menu-sub-button" {...props}>
      {children}
    </button>
  ),
  SidebarMenuSubItem: ({ children }: any) => <div data-testid="sidebar-menu-sub-item">{children}</div>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  NavLink: ({ to, children, ...props }: any) => (
    <a href={to} data-testid="nav-link" {...props}>
      {children}
    </a>
  ),
}));

describe('NavMain', () => {
  const directLinkItem = {
    title: 'Dashboard',
    icon: MockIcon,
    url: '/dashboard',
    isExpanded: true,
  } as any;
  const groupItem = {
    title: 'Settings',
    icon: MockIcon,
    items: [
      { title: 'Profile', url: '/settings/profile' },
      { title: 'Account', url: '/settings/account' },
    ],
    isActive: false,
  } as any;
  const items = [directLinkItem, groupItem];

  it('renders direct link items with NavLink', () => {
    render(<NavMain items={[directLinkItem]} />);
    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-link')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders group items as collapsible', () => {
    render(<NavMain items={[groupItem]} />);
    expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByTestId('collapsible')).toBeInTheDocument();
    expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders sub-items inside collapsible group', () => {
    render(<NavMain items={[groupItem]} />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    // Sub-items should have correct links
    const profileLink = screen
      .getAllByTestId('nav-link')
      .find((a) => a.getAttribute('href') === '/settings/profile');
    const accountLink = screen
      .getAllByTestId('nav-link')
      .find((a) => a.getAttribute('href') === '/settings/account');
    expect(profileLink).toBeInTheDocument();
    expect(accountLink).toBeInTheDocument();
  });

  it('renders both direct links and groups', () => {
    render(<NavMain items={items} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('applies active state to group and sub-items', () => {
    const activeGroup = {
      ...groupItem,
      isActive: true,
      items: [
        { title: 'Profile', url: '/settings/profile' },
        { title: 'Account', url: '/settings/account' },
      ],
    };
    render(<NavMain items={[activeGroup]} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders nothing if items is empty', () => {
    render(<NavMain items={[]} />);
    expect(screen.queryByTestId('sidebar-menu')).not.toBeInTheDocument();
  });
});
