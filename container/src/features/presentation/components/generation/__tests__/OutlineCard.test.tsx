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
    tryParseMarkdownToBlocks: vi.fn().mockResolvedValue([]),
    blocksToFullHTML: vi.fn().mockResolvedValue('<p>Converted HTML content</p>'),
    replaceBlocks: vi.fn(),
    document: {},
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
    htmlContent: '<p>Test content</p><h1>Test Heading</h1>',
    markdownContent: '# Test Heading\n\nTest content',
  };

  const standardProps = {
    id: 'test-id',
    title: 'Test Title',
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mock
    const mockStore = {
      handleOutlineChange: mockHandleOutlineChange,
      outlines: [mockOutlineItem],
    };

    (useOutlineStore as any).mockImplementation((selector: any) => {
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
    it('enters edit mode when content area is clicked', async () => {
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
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });
    });

    it('enters edit mode when Enter key is pressed on content area', async () => {
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
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });
    });

    it('enters edit mode when Space key is pressed on content area', async () => {
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
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
      });
    });
  });

  describe('Content Management', () => {
    it('saves content changes to store when editor changes', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      // Enter edit mode
      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');

      await act(async () => {
        fireEvent.click(contentArea!);
      });

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

    it('exits edit mode when editor loses focus', async () => {
      await act(async () => {
        renderWithProviders(<OutlineCard {...standardProps} />);
      });

      // Enter edit mode
      const buttons = screen.getAllByRole('button');
      const contentArea = buttons.find((btn) => btn.getAttribute('tabindex') === '0');

      await act(async () => {
        fireEvent.click(contentArea!);
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
        expect(screen.queryByTestId('rich-text-editor')).not.toBeInTheDocument();
      });
    });

    it('displays converted HTML content in view mode', async () => {
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
