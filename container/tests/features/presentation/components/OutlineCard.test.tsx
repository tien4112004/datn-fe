import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineCard from '@/features/presentation/components/OutlineCard';
import { useSortable } from '@dnd-kit/sortable';
import { fireEvent } from '@testing-library/react';

// Mock dependencies
vi.mock('@/shared/components/rte/useRichTextEditor', () => ({
  useRichTextEditor: vi.fn(() => ({})),
}));

vi.mock('@dnd-kit/sortable', () => {
  const mockUseSortable = vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }));

  return {
    useSortable: mockUseSortable,
  };
});

vi.mock('@/shared/components/rte/RichTextEditor', () => ({
  default: vi.fn(() => <div data-testid="rich-text-editor">Rich Text Editor</div>),
}));

// Test suite for OutlineCard component
describe('OutlineCard', () => {
  const defaultProps = {
    id: 'test-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<OutlineCard {...defaultProps} />);

    expect(screen.getByText('Outline')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<OutlineCard {...defaultProps} title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<OutlineCard {...defaultProps} className="custom-class" />);

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('shows dragging opacity when isDragging is true', () => {
    vi.mocked(useSortable).mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: true,
    } as any);

    const { container } = render(<OutlineCard {...defaultProps} />);

    expect(container.querySelector('.opacity-50')).toBeInTheDocument();
  });

  it('applies transform styles when dragging', () => {
    vi.mocked(useSortable).mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: { x: 10, y: 20 },
      transition: 'transform 200ms',
      isDragging: false,
    } as any);

    const { container } = render(<OutlineCard {...defaultProps} />);
    const card = container.querySelector('[style*="transform"]');

    expect(card).toBeInTheDocument();
  });

  it('renders delete button when onDelete prop is provided', () => {
    const mockOnDelete = vi.fn();
    render(<OutlineCard {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton.querySelector('[data-testid="trash-icon"]')).toBeNull();
  });

  it('does not render delete button when onDelete prop is not provided', () => {
    render(<OutlineCard {...defaultProps} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onDelete after delay when delete button is clicked', async () => {
    const mockOnDelete = vi.fn();
    vi.useFakeTimers();

    render(<OutlineCard {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('applies deletion scale animation when delete is triggered', () => {
    const mockOnDelete = vi.fn();
    const { container } = render(<OutlineCard {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    expect(container.querySelector('.scale-0')).toBeInTheDocument();
  });

  it('renders with custom text content', () => {
    const customTexts = [
      {
        type: 'paragraph',
        content: 'Custom content for testing',
      },
    ];

    const mockUseRichTextEditor = vi.mocked(
      require('@/shared/components/rte/useRichTextEditor').useRichTextEditor
    );

    render(<OutlineCard {...defaultProps} texts={customTexts as any} />);

    expect(mockUseRichTextEditor).toHaveBeenCalledWith({
      initialContent: customTexts,
    });
  });

  it('generates correct sortable id based on card id', () => {
    const mockUseSortable = vi.mocked(useSortable);

    render(<OutlineCard {...defaultProps} id="test-123" />);

    expect(mockUseSortable).toHaveBeenCalledWith({
      id: 'outline-card-test-123',
    });
  });
});
