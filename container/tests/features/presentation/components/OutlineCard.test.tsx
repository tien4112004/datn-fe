import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineCard from '@/features/presentation/components/generation/OutlineCard';
import { useSortable } from '@dnd-kit/sortable';
import { fireEvent } from '@testing-library/react';

// Mock dependencies
const mockEditor = {
  tryParseHTMLToBlocks: vi.fn().mockResolvedValue([]),
  replaceBlocks: vi.fn(),
  document: [],
  blocksToFullHTML: vi.fn().mockResolvedValue('<p>test content</p>'),
};

vi.mock('@/shared/components/rte/useRichTextEditor', () => ({
  useRichTextEditor: vi.fn(() => mockEditor),
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
  default: vi.fn(({ onChange }) => {
    // Simulate editor interaction
    if (onChange) {
      setTimeout(() => onChange(mockEditor), 0);
    }
    return <div data-testid="rich-text-editor">Rich Text Editor</div>;
  }),
}));

// Mock UI components
vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Trash: () => <div data-testid="trash-icon">Trash</div>,
}));

// Test suite for OutlineCard component
describe('OutlineCard', () => {
  const mockOnContentChange = vi.fn();
  const defaultProps = {
    id: 'test-id',
    onContentChange: mockOnContentChange,
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

    const deleteButton = screen.getByTestId('button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('does not render delete button when onDelete prop is not provided', () => {
    render(<OutlineCard {...defaultProps} />);

    expect(screen.queryByTestId('button')).not.toBeInTheDocument();
  });

  it('calls onDelete after delay when delete button is clicked', async () => {
    const mockOnDelete = vi.fn();
    vi.useFakeTimers();

    render(<OutlineCard {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTestId('button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('applies deletion scale animation when delete is triggered', () => {
    const mockOnDelete = vi.fn();
    const { container } = render(<OutlineCard {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTestId('button');
    fireEvent.click(deleteButton);

    expect(container.querySelector('.scale-0')).toBeInTheDocument();
  });

  it('calls onContentChange when editor content changes', async () => {
    const mockOnContentChange = vi.fn();
    render(<OutlineCard {...defaultProps} onContentChange={mockOnContentChange} />);

    // Wait for the editor onChange to be triggered
    await waitFor(() => {
      expect(mockOnContentChange).toHaveBeenCalledWith('<p>test content</p>');
    });
  });

  it('loads initial HTML content', async () => {
    const htmlContent = '<p>Initial content</p>';
    render(<OutlineCard {...defaultProps} htmlContent={htmlContent} />);

    await waitFor(() => {
      expect(mockEditor.tryParseHTMLToBlocks).toHaveBeenCalledWith(htmlContent);
      expect(mockEditor.replaceBlocks).toHaveBeenCalledWith(mockEditor.document, []);
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
