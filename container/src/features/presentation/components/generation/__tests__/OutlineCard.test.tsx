import { fireEvent, screen, waitFor, act } from '@testing-library/react';
import OutlineCard from '@/features/presentation/components/generation/OutlineCard';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';

// Mock the store
vi.mock('@/features/presentation/stores/useOutlineStore');

// Mock the RichTextEditor components
vi.mock('@/shared/components/rte/RichTextEditor', () => ({
  default: ({ onChange, onBlur, className }: any) => (
    <div
      className={className}
      data-testid="rich-text-editor"
      onClick={onChange}
      onBlur={onBlur}
      role="textbox"
      tabIndex={0}
    >
      Mock RTE Editor
    </div>
  ),
}));

vi.mock('@/shared/components/rte/useRichTextEditor', () => ({
  useRichTextEditor: () => ({
    tryParseMarkdownToBlocks: vi.fn().mockResolvedValue([{ type: 'paragraph', content: 'test' }]),
    tryParseHTMLToBlocks: vi.fn().mockResolvedValue([{ type: 'paragraph', content: 'test' }]),
    blocksToFullHTML: vi.fn().mockResolvedValue('<p>Converted HTML content</p>'),
    replaceBlocks: vi.fn(),
    focus: vi.fn(),
    document: [{ type: 'paragraph', content: 'test' }],
    blocksToMarkdownLossy: vi.fn().mockResolvedValue('# Updated markdown content'),
  }),
}));

// Mock drag and drop
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

describe('OutlineCard', () => {
  const mockOnDelete = vi.fn();
  const mockHandleOutlineChange = vi.fn();

  const mockOutlineItem = {
    id: 'test-id',
    markdownContent: '# Test Heading\n\nTest content',
  };

  const standardProps = {
    id: 'test-id',
    title: 'Test Title',
    onDelete: mockOnDelete,
  };

  let mockEditingId = '';
  let mockSetEditingId: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditingId = '';

    // Setup store mock
    mockSetEditingId = vi.fn((id: string) => {
      mockEditingId = id;
    });

    (useOutlineStore as any).mockImplementation((selector: any) => {
      const mockStore = {
        editingId: mockEditingId,
        handleMarkdownChange: mockHandleOutlineChange,
        outlines: [mockOutlineItem],
        isStreaming: false,
        setEditingId: mockSetEditingId,
      };

      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });
  });

  describe('Basic Rendering', () => {
    it('renders with correct title and default content', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');
      expect(contentArea).toBeInTheDocument();
    });

    it('renders with custom className', async () => {
      const { container } = await act(async () => {
        return renderWithProviders(<OutlineCard {...standardProps} className="custom-class" />);
      });

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edit Mode Interactions', () => {
    it('calls setEditingId when content area is clicked', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');

      expect(contentArea).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(contentArea!);
      });

      await waitFor(() => {
        expect(mockSetEditingId).toHaveBeenCalledWith('test-id');
      });
    });

    it('calls setEditingId when Enter key is pressed on content area', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');

      expect(contentArea).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(contentArea!, { key: 'Enter' });
      });

      await waitFor(() => {
        expect(mockSetEditingId).toHaveBeenCalledWith('test-id');
      });
    });

    it('calls setEditingId when Space key is pressed on content area', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');

      expect(contentArea).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(contentArea!, { key: ' ' });
      });

      await waitFor(() => {
        expect(mockSetEditingId).toHaveBeenCalledWith('test-id');
      });
    });
  });

  describe('Content Management', () => {
    it('saves content changes to store when editor changes in edit mode', async () => {
      // Setup store to return editing state
      mockEditingId = 'test-id';
      (useOutlineStore as any).mockImplementation((selector: any) => {
        const mockStore = {
          editingId: mockEditingId,
          handleMarkdownChange: mockHandleOutlineChange,
          outlines: [mockOutlineItem],
          isStreaming: false,
          setEditingId: mockSetEditingId,
        };

        if (typeof selector === 'function') {
          return selector(mockStore);
        }
        return mockStore;
      });

      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      // Should render editor in edit mode
      await waitFor(() => {
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });

      // Trigger change
      const editor = screen.getByTestId('rich-text-editor');

      await act(async () => {
        fireEvent.click(editor);
      });

      await waitFor(() => {
        expect(mockHandleOutlineChange).toHaveBeenCalledWith('test-id', '# Updated markdown content');
      });
    });

    it('calls setEditingId with empty string when editor loses focus', async () => {
      // Setup store to return editing state
      mockEditingId = 'test-id';
      (useOutlineStore as any).mockImplementation((selector: any) => {
        const mockStore = {
          editingId: mockEditingId,
          handleMarkdownChange: mockHandleOutlineChange,
          outlines: [mockOutlineItem],
          isStreaming: false,
          setEditingId: mockSetEditingId,
        };

        if (typeof selector === 'function') {
          return selector(mockStore);
        }
        return mockStore;
      });

      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });

      // Trigger blur
      const editor = screen.getByTestId('rich-text-editor');

      await act(async () => {
        fireEvent.blur(editor);
      });

      await waitFor(() => {
        expect(mockSetEditingId).toHaveBeenCalledWith('');
      });
    });

    it('displays content in view mode when not editing', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      // Should display the content area in view mode initially
      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');
      expect(contentArea).toBeInTheDocument();
      expect(screen.queryByTestId('rich-text-editor')).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('calls onDelete with correct id when delete button is clicked', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      const deleteButton = screen
        .getAllByRole('button')
        .find((btn) => btn.querySelector('svg')?.classList.contains('lucide-trash'));

      expect(deleteButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(deleteButton!);
      });

      // Wait for the timeout in handleDelete
      await waitFor(
        () => {
          expect(mockOnDelete).toHaveBeenCalledWith('test-id');
        },
        { timeout: 500 }
      );
    });

    it('does not render delete button when onDelete is not provided', async () => {
      const propsWithoutDelete = {
        id: 'test-id',
        title: 'Test Title',
      };

      await act(async () => {
        renderWithProviders(<OutlineCard {...propsWithoutDelete} />);
      });

      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.querySelector('svg')?.classList.contains('lucide-trash'));
      expect(deleteButtons).toHaveLength(0);
    });
  });
});
