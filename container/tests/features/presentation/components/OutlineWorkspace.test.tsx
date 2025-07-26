import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineWorkspace from '@/features/presentation/components/OutlineWorkspace';
import type { OutlineItem } from '@/features/presentation/types/outline';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn(({ children }) => <div data-testid="dnd-context">{children}</div>),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: vi.fn(({ children }) => <div data-testid="sortable-context">{children}</div>),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: vi.fn((array, oldIndex, newIndex) => {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
  }),
}));

vi.mock('@/features/presentation/components/OutlineCard', () => ({
  default: vi.fn(({ id, title }) => <div data-testid={`outline-card-${id}`}>OutlineCard {title}</div>),
}));

vi.mock('lucide-react', () => ({
  Plus: vi.fn(() => <div data-testid="plus-icon">+</div>),
  Download: vi.fn(() => <div data-testid="download-icon">↓</div>),
  Loader: vi.fn(() => <div data-testid="loader-icon">...</div>),
}));

// Test suite for OutlineWorkspace component
describe('OutlineWorkspace', () => {
  const mockItems: OutlineItem[] = [{ id: '1' }, { id: '2' }, { id: '3' }];

  const mockSetItems = vi.fn();
  const mockOnDownload = vi.fn();

  const defaultProps = {
    items: mockItems,
    setItems: mockSetItems,
    onDownload: mockOnDownload,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders outline cards from items array', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByTestId('outline-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('outline-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('outline-card-3')).toBeInTheDocument();
  });

  it('shows correct item count', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText('3 outlineCards')).toBeInTheDocument();
  });

  it('renders add button with correct text', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText('addOutlineCard')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('adds new item when add button is clicked', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    const addButton = screen.getByText('addOutlineCard');
    fireEvent.click(addButton);

    expect(mockSetItems).toHaveBeenCalledWith(expect.any(Function));
  });

  it('renders download button', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText('downloadOutline')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('calls onDownload when download button is clicked', async () => {
    mockOnDownload.mockResolvedValue(undefined);
    render(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText('downloadOutline');
    fireEvent.click(downloadButton);

    expect(mockOnDownload).toHaveBeenCalled();
  });

  it('shows loading state during download', async () => {
    let resolveDownload: () => void;
    const downloadPromise = new Promise<void>((resolve) => {
      resolveDownload = resolve;
    });
    mockOnDownload.mockReturnValue(downloadPromise);

    render(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText('downloadOutline');
    fireEvent.click(downloadButton);

    expect(screen.getByText('downloading')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    resolveDownload!();
    await waitFor(() => {
      expect(screen.getByText('downloadOutline')).toBeInTheDocument();
    });
  });

  it('disables download button during download', async () => {
    let resolveDownload: () => void;
    const downloadPromise = new Promise<void>((resolve) => {
      resolveDownload = resolve;
    });
    mockOnDownload.mockReturnValue(downloadPromise);

    render(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText('downloadOutline');
    fireEvent.click(downloadButton);

    expect(downloadButton.closest('button')).toBeDisabled();

    resolveDownload!();
    await waitFor(() => {
      expect(downloadButton.closest('button')).not.toBeDisabled();
    });
  });

  it('handles empty items array', () => {
    render(<OutlineWorkspace {...defaultProps} items={[]} />);

    expect(screen.getByText('0 outlineCards')).toBeInTheDocument();
    expect(screen.queryByTestId('outline-card-1')).not.toBeInTheDocument();
  });

  it('handles missing onDownload prop', () => {
    const { onDownload, ...propsWithoutDownload } = defaultProps;
    render(<OutlineWorkspace {...propsWithoutDownload} />);

    const downloadButton = screen.getByText('downloadOutline');
    fireEvent.click(downloadButton);

    // Should not throw error
    expect(downloadButton).toBeInTheDocument();
  });

  it('renders with drag and drop context', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });
});
