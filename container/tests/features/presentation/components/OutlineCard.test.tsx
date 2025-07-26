import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineCard from '@/features/presentation/components/OutlineCard';
import { useSortable } from '@dnd-kit/sortable';

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
    });

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
    });

    const { container } = render(<OutlineCard {...defaultProps} />);
    const card = container.querySelector('[style*="transform"]');

    expect(card).toBeInTheDocument();
  });
});
