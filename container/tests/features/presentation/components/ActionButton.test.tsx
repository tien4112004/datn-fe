import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionButton from '@/features/presentation/components/table/ActionButton';

const mockUseTranslation = vi.fn();

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="button">
      {children}
    </button>
  ),
}));

describe('ActionButton', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'actionButton.edit': 'Edit',
      'actionButton.delete': 'Delete',
    };
    return translations[key] || key;
  });

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });
  });

  it('renders popover trigger with ellipsis icon', () => {
    render(<ActionButton onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons with correct translations', () => {
    render(<ActionButton onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(mockT).toHaveBeenCalledWith('actionButton.edit');
    expect(mockT).toHaveBeenCalledWith('actionButton.delete');
  });

  it('calls onEdit callback when Edit button is clicked', () => {
    render(<ActionButton onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete callback when Delete button is clicked', () => {
    render(<ActionButton onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('handles optional props correctly when callbacks are undefined', () => {
    render(<ActionButton />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();

    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');

    expect(() => fireEvent.click(editButton)).not.toThrow();
    expect(() => fireEvent.click(deleteButton)).not.toThrow();
  });

  it('uses translation hook correctly', () => {
    render(<ActionButton onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(mockUseTranslation).toHaveBeenCalledTimes(1);
    expect(mockT).toHaveBeenCalledWith('actionButton.edit');
    expect(mockT).toHaveBeenCalledWith('actionButton.delete');
  });
});
