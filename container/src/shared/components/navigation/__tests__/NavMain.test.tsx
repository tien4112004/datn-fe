import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NavMain } from '../NavMain';

// Mock translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Sidebar context
vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: any) => <div data-testid="sidebar-group">{children}</div>,
  SidebarMenu: ({ children }: any) => <div data-testid="sidebar-menu">{children}</div>,
  SidebarMenuItem: ({ children }: any) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarMenuButton: ({ children, isActive }: any) => (
    <button data-testid="sidebar-menu-button" data-active={isActive}>
      {children}
    </button>
  ),
}));

// Mock Router context
vi.mock('react-router-dom', () => ({
  NavLink: ({ to, children, asChild }: any) => {
    const childContent = typeof children === 'function' ? children({ isActive: to === '/home' }) : children;

    return (
      <a href={to} data-testid={`nav-link-${to.replace('/', '')}`}>
        {asChild ? childContent : <div>{childContent}</div>}
      </a>
    );
  },
}));

describe('NavMain', () => {
  it('should render nothing when there are no items', () => {
    render(<NavMain items={[]} />);

    expect(document.body.innerHTML).toBe('<div></div>');
  });

  it('should render navigation items', () => {
    const items = [
      { title: 'Home', icon: () => <span>🏠</span>, url: '/home' },
      { title: 'Profile', icon: () => <span>👤</span>, url: '/profile' },
    ];

    const { getByText } = render(<NavMain items={items} />);

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Profile')).toBeInTheDocument();
  });
});
