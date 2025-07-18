import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SidebarLanguageSwitcher from '@/shared/components/navigation/SidebarLanguageSwitcher'

const mockChangeLanguage = vi.fn()
const mockUseTranslation = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
}))

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}))

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button data-testid="button" onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/shared/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, className, ...props }: any) => (
    <button data-testid="sidebar-menu-button" className={className} {...props}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: any) => <div data-testid="sidebar-menu-item">{children}</div>,
}))

vi.mock('lucide-react', () => ({
  Languages: () => <div data-testid="languages-icon" />,
  Check: () => <div data-testid="check-icon" />,
}))

vi.mock('clsx', () => ({
  default: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('SidebarLanguageSwitcher', () => {
  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      },
    })
    mockChangeLanguage.mockClear()
  })

  it('renders the language switcher trigger correctly', () => {
    render(<SidebarLanguageSwitcher />)
    
    expect(screen.getByTestId('sidebar-menu-item')).toBeInTheDocument()
    expect(screen.getByTestId('popover')).toBeInTheDocument()
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('languages-icon')).toBeInTheDocument()
  })

  it('displays current language correctly for English', () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      },
    })

    render(<SidebarLanguageSwitcher />)

    expect(screen.getAllByText('English')).toHaveLength(2)
    expect(screen.getAllByText('🇬🇧')).toHaveLength(1)
  })

  it('displays current language correctly for Vietnamese', () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'vi',
        changeLanguage: mockChangeLanguage,
      },
    })

    render(<SidebarLanguageSwitcher />)

    expect(screen.getAllByText('🇻🇳')).toHaveLength(1)
  })

  it('renders all language options in popover content', () => {
    render(<SidebarLanguageSwitcher />)
    
    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
    
    expect(screen.getAllByText('English')).toHaveLength(2)
    expect(screen.getAllByText('Tiếng Việt')).toHaveLength(1)
    
    expect(screen.getAllByText('🇬🇧')).toHaveLength(1)
    expect(screen.getAllByText('🇻🇳')).toHaveLength(1)
  })

  it('shows check icon for current language', () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      },
    })

    render(<SidebarLanguageSwitcher />)
    
    // Check icon should be present for current language
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('calls changeLanguage when a different language is selected', () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
      },
    })

    render(<SidebarLanguageSwitcher />)
    
    // Find and click the Vietnamese language button
    const buttons = screen.getAllByTestId('button')
    const vietnameseButton = buttons.find(button => 
      button.textContent?.includes('Tiếng Việt')
    )
    
    expect(vietnameseButton).toBeInTheDocument()
    fireEvent.click(vietnameseButton!)
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('vi')
  })

  it('handles unknown language code gracefully', () => {
    mockUseTranslation.mockReturnValue({
      i18n: {
        language: 'fr', // Unknown language
        changeLanguage: mockChangeLanguage,
      },
    })

    render(<SidebarLanguageSwitcher />)
    
    expect(screen.getByTestId('sidebar-menu-item')).toBeInTheDocument()
    expect(screen.getByTestId('languages-icon')).toBeInTheDocument()
  })

  it('renders language options as buttons', () => {
    render(<SidebarLanguageSwitcher />)
    
    const buttons = screen.getAllByTestId('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
