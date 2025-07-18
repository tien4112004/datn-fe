import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NavUser } from '@/shared/components/navigation/NavUser'

const mockUseSidebar = vi.fn()
vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu">{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-menu-item">{children}</div>,
  SidebarMenuButton: ({ children, className, size, ...props }: any) => (
    <button data-testid="sidebar-menu-button" className={className} {...props}>
      {children}
    </button>
  ),
  useSidebar: () => mockUseSidebar(),
}))

vi.mock('@/shared/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div data-testid="avatar" className={className}>{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
}))

vi.mock('@/shared/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children, side }: any) => <div data-testid="dropdown-content" data-side={side}>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div data-testid="dropdown-group">{children}</div>,
  DropdownMenuItem: ({ children }: any) => <div data-testid="dropdown-item">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}))

vi.mock('lucide-react', () => ({
  ChevronsUpDown: () => <div data-testid="chevrons-up-down-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  BadgeCheck: () => <div data-testid="badge-check-icon" />,
  CreditCard: () => <div data-testid="credit-card-icon" />,
  LogOut: () => <div data-testid="log-out-icon" />,
}))

describe('NavUser', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }

  beforeEach(() => {
    mockUseSidebar.mockReturnValue({ isMobile: false })
  })

  it('renders user information correctly', () => {
    render(<NavUser user={mockUser} />)

    expect(screen.getAllByText('John Doe')).toHaveLength(2)
    expect(screen.getAllByText('john@example.com')).toHaveLength(2)
    expect(screen.getAllByTestId('avatar-image')).toHaveLength(2)
    
    const avatarImages = screen.getAllByTestId('avatar-image')
    avatarImages.forEach(img => {
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      expect(img).toHaveAttribute('alt', 'John Doe')
    })
  })

  it('displays dropdown trigger with chevron icon', () => {
    render(<NavUser user={mockUser} />)
    
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('chevrons-up-down-icon')).toBeInTheDocument()
  })

  it('renders dropdown menu items', () => {
    render(<NavUser user={mockUser} />)
    
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('handles empty user name', () => {
    const userWithEmptyName = { ...mockUser, name: '' }
    render(<NavUser user={userWithEmptyName} />)
    
    expect(screen.queryByTestId('avatar-fallback')).not.toBeInTheDocument()
    expect(screen.getAllByText(/no name/i)).toHaveLength(2)
    expect(screen.getAllByText('john@example.com')).toHaveLength(2)
  })

  it('handles empty user email', () => {
    const userWithEmptyEmail = { ...mockUser, email: '' }
    render(<NavUser user={userWithEmptyEmail} />)
    
    expect(screen.getAllByText('John Doe')).toHaveLength(2)
    expect(screen.getAllByText(/no email/i)).toHaveLength(2)
    expect(screen.getByTestId('sidebar-menu-button')).toBeInTheDocument()
  })

  it('handles empty avatar with fallback', () => {
    const userWithEmptyAvatar = { ...mockUser, avatar: '' }
    render(<NavUser user={userWithEmptyAvatar} />)
    
    expect(screen.getAllByTestId('avatar-fallback')).toHaveLength(2)
    expect(screen.getAllByText('CN')).toHaveLength(2)
  })

  it('sets dropdown content side to "right" on desktop', () => {
    mockUseSidebar.mockReturnValue({ isMobile: false })
    render(<NavUser user={mockUser} />)
    
    expect(screen.getByTestId('dropdown-content')).toHaveAttribute('data-side', 'right')
  })

  it('sets dropdown content side to "bottom" on mobile', () => {
    mockUseSidebar.mockReturnValue({ isMobile: true })
    render(<NavUser user={mockUser} />)
    
    expect(screen.getByTestId('dropdown-content')).toHaveAttribute('data-side', 'bottom')
  })

  it('renders all menu icons', () => {
    render(<NavUser user={mockUser} />)
    
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    expect(screen.getByTestId('badge-check-icon')).toBeInTheDocument()
    expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument()
    expect(screen.getByTestId('log-out-icon')).toBeInTheDocument()
  })

  it('renders menu separators', () => {
    render(<NavUser user={mockUser} />)
    
    expect(screen.getAllByTestId('dropdown-separator')).toHaveLength(3)
  })
})
