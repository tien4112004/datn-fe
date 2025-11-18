import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavUser } from '@/shared/components/navigation/NavUser';
import { renderWithProviders } from '@/tests/test-utils';

// Only mock the sidebar hook since it's external state
const mockUseSidebar = vi.fn();
vi.mock('@/shared/components/ui/sidebar', async () => {
  const actual = await vi.importActual('@/shared/components/ui/sidebar');
  return {
    ...actual,
    useSidebar: () => mockUseSidebar(),
  };
});

describe('NavUser', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSidebar.mockReturnValue({ isMobile: false });
  });

  it('displays user name and email correctly', () => {
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('opens dropdown menu when user clicks the trigger button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    const triggerButton = screen.getByRole('button');
    await user.click(triggerButton);

    // Check if dropdown menu items are visible
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('shows user information in dropdown header when opened', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    const triggerButton = screen.getByRole('button');
    await user.click(triggerButton);

    // User info should appear twice: once in button, once in dropdown
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    expect(screen.getAllByText('john@example.com')).toHaveLength(2);
  });

  it('uses "right" side positioning on desktop', async () => {
    mockUseSidebar.mockReturnValue({ isMobile: false });
    const user = userEvent.setup();
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    const triggerButton = screen.getByRole('button');
    await user.click(triggerButton);

    // We can't directly test the side prop, but we can verify the dropdown opens
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('uses "bottom" side positioning on mobile', async () => {
    mockUseSidebar.mockReturnValue({ isMobile: true });
    const user = userEvent.setup();
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    const triggerButton = screen.getByRole('button');
    await user.click(triggerButton);

    // We can't directly test the side prop, but we can verify the dropdown opens
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('renders all menu items with correct text', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    const triggerButton = screen.getByRole('button');
    await user.click(triggerButton);

    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('handles user with all empty fields', () => {
    const emptyUser = { name: '', email: '', avatar: '' };
    renderWithProviders(<NavUser user={emptyUser} />, { includeProviders: ['auth'] });

    expect(screen.getAllByText('No Name')).toHaveLength(1);
    expect(screen.getAllByText('No Email')).toHaveLength(1);
    expect(screen.getAllByText('CN')).toHaveLength(1);
  });

  it('handles very long user name and email', () => {
    const userWithLongInfo = {
      name: 'This is a very long user name that should be truncated',
      email: 'very.long.email.address.that.should.be.truncated@example.com',
      avatar: mockUser.avatar,
    };

    renderWithProviders(<NavUser user={userWithLongInfo} />, { includeProviders: ['auth'] });

    expect(screen.getByText(userWithLongInfo.name)).toBeInTheDocument();
    expect(screen.getByText(userWithLongInfo.email)).toBeInTheDocument();
  });

  it('maintains functionality when dropdown is opened and closed multiple times', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavUser user={mockUser} />, { includeProviders: ['auth'] });

    const triggerButton = screen.getByRole('button');

    // Open dropdown
    await user.click(triggerButton);
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();

    // Close dropdown by pressing Escape
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Upgrade to Pro')).not.toBeInTheDocument();

    // Open again
    await user.click(triggerButton);
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });
});
