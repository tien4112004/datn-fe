import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OutlineWorkspace from '@/features/presentation/components/generation/OutlineWorkspace';
// import OutlineCard from '@/features/presentation/components/generation/OutlineCard';
// import type { OutlineItem } from '@/features/presentation/types/outline';
import { renderWithProviders } from '@/tests/test-utils';

// vi.mock('react-i18next', () => ({
//   useTranslation: vi.fn(() => ({
//     t: (key: string) => key,
//   })),
// }));

// vi.mock('@dnd-kit/core', () => ({
//   DndContext: vi.fn(({ children, onDragEnd }) => {
//     // Expose onDragEnd for testing
//     (globalThis as any).__dndOnDragEnd = onDragEnd;
//     return <div data-testid="dnd-context">{children}</div>;
//   }),
//   useSensors: vi.fn(() => []),
//   PointerSensor: vi.fn(),
//   KeyboardSensor: vi.fn(),
// }));

// vi.mock('@dnd-kit/sortable', () => ({
//   SortableContext: vi.fn(({ children }) => <div data-testid="sortable-context">{children}</div>),
//   sortableKeyboardCoordinates: vi.fn(),
//   verticalListSortingStrategy: vi.fn(),
//   arrayMove: vi.fn((array, oldIndex, newIndex) => {
//     const result = [...array];
//     const [removed] = result.splice(oldIndex, 1);
//     result.splice(newIndex, 0, removed);
//     return result;
//   }),
// }));

// vi.mock('@/features/presentation/components/generation/OutlineCard', () => ({
//   default: vi.fn(({ id, title, onDelete, onContentChange }) => (
//     <div
//       data-testid={`outline-card-${id}`}
//       onClick={onDelete}
//       onInput={(e) => onContentChange?.((e.target as HTMLElement).textContent || '')}
//     >
//       OutlineCard {title}
//     </div>
//   )),
// }));

// vi.mock('@/shared/components/ui/button', () => ({
//   Button: ({ children, onClick, disabled, ...props }: any) => (
//     <button onClick={onClick} disabled={disabled} {...props}>
//       {children}
//     </button>
//   ),
// }));

// vi.mock('lucide-react', () => ({
//   Plus: vi.fn(() => <div data-testid="plus-icon">+</div>),
//   Download: vi.fn(() => <div data-testid="download-icon">↓</div>),
//   Loader: vi.fn(() => <div data-testid="loader-icon">...</div>),
// }));

// const mockOutlineCard = vi.mocked(OutlineCard);

// Test suite for OutlineWorkspace component
describe('OutlineWorkspace', () => {
  // const mockItems: OutlineItem[] = [
  //   { id: '1', htmlContent: '<p>Content 1</p>', markdownContent: 'Content 1' },
  //   { id: '2', htmlContent: '<p>Content 2</p>', markdownContent: 'Content 2' },
  //   { id: '3', htmlContent: '<p>Content 3</p>', markdownContent: 'Content 3' },
  // ];

  // const mockSetItems = vi.fn();
  const mockOnDownload = vi.fn();

  const defaultProps = {
    // items: mockItems,
    // setItems: mockSetItems,
    onDownload: mockOnDownload,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnDownload.mockReset();
  });

  it('renders add button with correct text', () => {
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText(/add outline card/i)).toHaveRole('button');
  });

  it('adds new item when add button is clicked', () => {
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const addButton = screen.getByText(/add outline card/i);
    fireEvent.click(addButton);

    const newCard = screen.getByText(/1 outline card/i);
    expect(newCard).toBeInTheDocument();
  });

  it('renders download button', () => {
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    expect(screen.getByText(/download/i)).toHaveRole('button');
  });

  it('calls onDownload when download button is clicked', async () => {
    mockOnDownload.mockResolvedValue(undefined);
    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

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

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    await act(async () => {
      fireEvent.click(downloadButton);
    });

    expect(screen.getByText(/downloading/i)).toBeInTheDocument();

    await act(async () => {
      resolveDownload!();
      await downloadPromise;
    });

    await waitFor(() => {
      expect(screen.getByText(/download/i)).toBeInTheDocument();
    });
  });

  it('disables download button during download', async () => {
    let resolveDownload: () => void;
    const downloadPromise = new Promise<void>((resolve) => {
      resolveDownload = resolve;
    });
    mockOnDownload.mockReturnValue(downloadPromise);

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

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

  it('handles missing onDownload prop', async () => {
    renderWithProviders(<OutlineWorkspace />);
    const downloadButton = screen.getByText(/download/i);

    // Should not throw error
    expect(downloadButton).toBeInTheDocument();
  });

  it('prevents multiple simultaneous downloads', async () => {
    let resolveFirstDownload: () => void;
    const firstDownloadPromise = new Promise<void>((resolve) => {
      resolveFirstDownload = resolve;
    });
    mockOnDownload.mockImplementation(() => firstDownloadPromise);

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

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
      expect(screen.getByText(/download/i)).toBeInTheDocument();
    });
  });

  it('handles download errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the download function to throw an error
    mockOnDownload.mockImplementation(async () => {
      throw new Error('Download failed');
    });

    renderWithProviders(<OutlineWorkspace {...defaultProps} />);

    const downloadButton = screen.getByText(/download/i);

    await act(async () => {
      fireEvent.click(downloadButton);
      // Wait for the async error handling to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await waitFor(() => {
      expect(screen.getByText(/download/i)).toBeInTheDocument();
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
});
