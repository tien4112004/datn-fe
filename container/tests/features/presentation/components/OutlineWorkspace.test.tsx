import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineWorkspace from '@/features/presentation/components/generation/OutlineWorkspace';
import OutlineCard from '@/features/presentation/components/generation/OutlineCard';
import type { OutlineItem } from '@/features/presentation/types/outline';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn(({ children, onDragEnd }) => {
    // Expose onDragEnd for testing
    (globalThis as any).__dndOnDragEnd = onDragEnd;
    return <div data-testid="dnd-context">{children}</div>;
  }),
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

vi.mock('@/features/presentation/components/generation/OutlineCard', () => ({
  default: vi.fn(({ id, title, onDelete, onContentChange }) => (
    <div
      data-testid={`outline-card-${id}`}
      onClick={onDelete}
      onInput={(e) => onContentChange?.((e.target as HTMLElement).textContent || '')}
    >
      OutlineCard {title}
    </div>
  )),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Plus: vi.fn(() => <div data-testid="plus-icon">+</div>),
  Download: vi.fn(() => <div data-testid="download-icon">↓</div>),
  Loader: vi.fn(() => <div data-testid="loader-icon">...</div>),
}));

// const mockOutlineCard = vi.mocked(OutlineCard);

// Test suite for OutlineWorkspace component
describe('OutlineWorkspace', () => {
  const mockItems: OutlineItem[] = [
    { id: '1', htmlContent: '<p>Content 1</p>' },
    { id: '2', htmlContent: '<p>Content 2</p>' },
    { id: '3', htmlContent: '<p>Content 3</p>' },
  ];

  const mockSetItems = vi.fn();
  const mockOnDownload = vi.fn();

  const defaultProps = {
    items: mockItems,
    setItems: mockSetItems,
    onDownload: mockOnDownload,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnDownload.mockReset();
  });

  // it('renders outline cards from items array', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   expect(screen.getByTestId('outline-card-1')).toBeInTheDocument();
  //   expect(screen.getByTestId('outline-card-2')).toBeInTheDocument();
  //   expect(screen.getByTestId('outline-card-3')).toBeInTheDocument();
  // });

  // it('shows correct item count', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   expect(screen.getByText('3 outlineCards')).toBeInTheDocument();
  // });

  it('renders add button with correct text', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText('addOutlineCard')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  // it('adds new item when add button is clicked', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   const addButton = screen.getByText('addOutlineCard');
  //   fireEvent.click(addButton);

  //   expect(mockSetItems).toHaveBeenCalledWith([
  //     ...mockItems,
  //     expect.objectContaining({
  //       id: expect.any(String),
  //       htmlContent: '',
  //     }),
  //   ]);
  // });

  it('renders download button', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText('downloadOutline')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('calls onDownload when download button is clicked', async () => {
    mockOnDownload.mockResolvedValue(undefined);
    render(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText('downloadOutline');

    await act(async () => {
      fireEvent.click(downloadButton);
    });

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

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(screen.getByText('downloading')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    await act(async () => {
      resolveDownload!();
      await downloadPromise;
    });

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

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(downloadButton.closest('button')).toBeDisabled();

    await act(async () => {
      resolveDownload!();
      await downloadPromise;
    });

    await waitFor(() => {
      expect(downloadButton.closest('button')).not.toBeDisabled();
    });
  });

  // it('handles empty items array', () => {
  //   render(<OutlineWorkspace {...defaultProps} items={[]} />);

  //   expect(screen.getByText('0 outlineCards')).toBeInTheDocument();
  //   expect(screen.queryByTestId('outline-card-1')).not.toBeInTheDocument();
  // });

  // it('handles missing onDownload prop', async () => {
  //   const { onDownload, ...propsWithoutDownload } = defaultProps;
  //   render(<OutlineWorkspace {...propsWithoutDownload} />);

  //   const downloadButton = screen.getByText('downloadOutline');

  //   await act(async () => {
  //     fireEvent.click(downloadButton);
  //   });

  //   // Should not throw error
  //   expect(downloadButton).toBeInTheDocument();
  // });

  // it('renders with drag and drop context', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
  //   expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  // });

  // it('calls handleDelete when delete is triggered from OutlineCard', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   const cardProps = mockOutlineCard.mock.calls[0][0];
  //   cardProps.onDelete?.();

  //   expect(mockSetItems).toHaveBeenCalledWith([
  //     { id: '2', htmlContent: '<p>Content 2</p>' },
  //     { id: '3', htmlContent: '<p>Content 3</p>' },
  //   ]);
  // });

  // it('calls handleContentChange when content is updated from OutlineCard', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   const cardProps = mockOutlineCard.mock.calls[0][0];
  //   const newContent = '<p>Updated content</p>';
  //   cardProps.onContentChange?.(newContent);

  //   expect(mockSetItems).toHaveBeenCalledWith([
  //     { id: '1', htmlContent: newContent },
  //     { id: '2', htmlContent: '<p>Content 2</p>' },
  //     { id: '3', htmlContent: '<p>Content 3</p>' },
  //   ]);
  // });

  // it('renders items with correct sequential titles', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   expect(mockOutlineCard).toHaveBeenNthCalledWith(1, expect.objectContaining({ title: '1' }), undefined);
  //   expect(mockOutlineCard).toHaveBeenNthCalledWith(2, expect.objectContaining({ title: '2' }), undefined);
  //   expect(mockOutlineCard).toHaveBeenNthCalledWith(3, expect.objectContaining({ title: '3' }), undefined);
  // });

  it('prevents multiple simultaneous downloads', async () => {
    let resolveFirstDownload: () => void;
    const firstDownloadPromise = new Promise<void>((resolve) => {
      resolveFirstDownload = resolve;
    });
    mockOnDownload.mockImplementation(() => firstDownloadPromise);

    render(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText('downloadOutline');

    // Click twice rapidly
    fireEvent.click(downloadButton);
    fireEvent.click(downloadButton);

    // Should only be called once due to isDownloading state
    expect(mockOnDownload).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirstDownload!();
      await firstDownloadPromise;
    });

    await waitFor(() => {
      expect(screen.getByText('downloadOutline')).toBeInTheDocument();
    });
  });

  it('handles download errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the download function to throw an error
    mockOnDownload.mockImplementation(async () => {
      throw new Error('Download failed');
    });

    render(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText('downloadOutline');

    await act(async () => {
      fireEvent.click(downloadButton);
      // Wait for the async error handling to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await waitFor(() => {
      expect(screen.getByText('downloadOutline')).toBeInTheDocument();
    });

    expect(downloadButton.closest('button')).not.toBeDisabled();
    consoleErrorSpy.mockRestore();
  });

  // it('updates items count dynamically when items change', () => {
  //   const { rerender } = render(<OutlineWorkspace {...defaultProps} />);

  //   expect(screen.getByText('3 outlineCards')).toBeInTheDocument();

  //   rerender(<OutlineWorkspace {...defaultProps} items={[{ id: '1', htmlContent: '<p>Content 1</p>' }]} />);

  //   expect(screen.getByText('1 outlineCards')).toBeInTheDocument();
  // });

  // it('handles drag and drop reordering', () => {
  //   render(<OutlineWorkspace {...defaultProps} />);

  //   // Simulate drag end event
  //   const dragEndEvent = {
  //     active: { id: 'outline-card-1' },
  //     over: { id: 'outline-card-3' },
  //   };

  //   if ((globalThis as any).__dndOnDragEnd) {
  //     (globalThis as any).__dndOnDragEnd(dragEndEvent);
  //   }

  //   expect(mockSetItems).toHaveBeenCalledWith([
  //     { id: '2', htmlContent: '<p>Content 2</p>' },
  //     { id: '3', htmlContent: '<p>Content 3</p>' },
  //     { id: '1', htmlContent: '<p>Content 1</p>' },
  //   ]);
  // });

  it('ignores drag events without over target', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    const dragEndEvent = {
      active: { id: 'outline-card-1' },
      over: null,
    };

    if ((globalThis as any).__dndOnDragEnd) {
      (globalThis as any).__dndOnDragEnd(dragEndEvent);
    }

    expect(mockSetItems).not.toHaveBeenCalled();
  });

  it('ignores drag events with same source and target', () => {
    render(<OutlineWorkspace {...defaultProps} />);

    const dragEndEvent = {
      active: { id: 'outline-card-1' },
      over: { id: 'outline-card-1' },
    };

    if ((globalThis as any).__dndOnDragEnd) {
      (globalThis as any).__dndOnDragEnd(dragEndEvent);
    }

    expect(mockSetItems).not.toHaveBeenCalled();
  });
});
