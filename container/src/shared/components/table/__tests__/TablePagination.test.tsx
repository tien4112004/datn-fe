import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Table } from '@tanstack/react-table';
import TablePagination from '../TablePagination';

// Mock dependencies
const mockUseTranslation = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => mockUseTranslation(namespace),
}));

vi.mock('@/shared/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

vi.mock('@ui/button', () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      disabled,
      variant,
      size,
      className,
      'aria-label': ariaLabel,
      'aria-current': ariaCurrent,
    }) => (
      <button
        data-testid="button"
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-size={size}
        className={className}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
      >
        {children}
      </button>
    )
  ),
}));

vi.mock('@ui/select', () => ({
  Select: vi.fn(({ children, value, onValueChange }) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange?.('20')}>
      {children}
    </div>
  )),
  SelectContent: vi.fn(({ children }) => <div data-testid="select-content">{children}</div>),
  SelectItem: vi.fn(({ children, value }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  )),
  SelectTrigger: vi.fn(({ children, className }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  )),
  SelectValue: vi.fn(() => <div data-testid="select-value" />),
}));

vi.mock('lucide-react', () => ({
  ChevronLeft: vi.fn(() => <div data-testid="chevron-left">←</div>),
  ChevronRight: vi.fn(() => <div data-testid="chevron-right">→</div>),
  ChevronsLeft: vi.fn(() => <div data-testid="chevrons-left">⇐</div>),
  ChevronsRight: vi.fn(() => <div data-testid="chevrons-right">⇒</div>),
}));

describe('TablePagination', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      rowsPerPage: 'Rows per page',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      entries: 'entries',
      goToFirstPage: 'Go to first page',
      goToPreviousPage: 'Go to previous page',
      goToNextPage: 'Go to next page',
      goToLastPage: 'Go to last page',
      goToPage: 'Go to page',
    };
    return translations[key] || key;
  });

  const createMockTable = (overrides = {}): Partial<Table<any>> => {
    const defaults = {
      getState: vi.fn(() => ({
        pagination: { pageIndex: 0, pageSize: 10 },
      })),
      getPageCount: vi.fn(() => 5),
      getRowCount: vi.fn(() => 45),
      setPageSize: vi.fn(),
      firstPage: vi.fn(),
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      lastPage: vi.fn(),
      setPageIndex: vi.fn(),
      getCanPreviousPage: vi.fn(() => false),
      getCanNextPage: vi.fn(() => true),
    };
    return { ...defaults, ...overrides } as any;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });
  });

  describe('Basic Rendering', () => {
    it('renders pagination controls correctly', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 10 of 45 entries')).toBeInTheDocument();
    });

    it('renders all navigation buttons', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');

      // Should have: first, previous, page numbers (up to 5), next, last
      // First page scenario: first & previous disabled, pages 1-5, next & last enabled
      expect(buttons.length).toBeGreaterThanOrEqual(7); // At least first, prev, 1-5 pages, next, last

      // Check for navigation icons
      expect(screen.getByTestId('chevrons-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
      expect(screen.getByTestId('chevrons-right')).toBeInTheDocument();
    });

    it('uses translation correctly', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      expect(mockUseTranslation).toHaveBeenCalledWith('table');
      expect(mockT).toHaveBeenCalledWith('rowsPerPage');
      expect(mockT).toHaveBeenCalledWith('showing');
      expect(mockT).toHaveBeenCalledWith('to');
      expect(mockT).toHaveBeenCalledWith('of');
      expect(mockT).toHaveBeenCalledWith('entries');
    });
  });

  describe('Page Size Selection', () => {
    it('displays current page size', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 0, pageSize: 20 },
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', '20');
    });

    it('calls setPageSize when page size changes', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const select = screen.getByTestId('select');
      fireEvent.click(select);

      expect(table.setPageSize).toHaveBeenCalledWith(20);
    });

    it('renders all page size options', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const selectItems = screen.getAllByTestId('select-item');
      expect(selectItems).toHaveLength(5); // [10, 20, 30, 40, 50]

      expect(selectItems[0]).toHaveAttribute('data-value', '10');
      expect(selectItems[1]).toHaveAttribute('data-value', '20');
      expect(selectItems[2]).toHaveAttribute('data-value', '30');
      expect(selectItems[3]).toHaveAttribute('data-value', '40');
      expect(selectItems[4]).toHaveAttribute('data-value', '50');
    });
  });

  describe('Page Information Display', () => {
    it('calculates and displays correct entry range for first page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 0, pageSize: 10 },
        })),
        getRowCount: vi.fn(() => 45),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Showing 1 to 10 of 45 entries')).toBeInTheDocument();
    });

    it('calculates and displays correct entry range for middle page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // Page 3 (0-indexed)
        })),
        getRowCount: vi.fn(() => 45),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Showing 21 to 30 of 45 entries')).toBeInTheDocument();
    });

    it('calculates and displays correct entry range for last page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 4, pageSize: 10 }, // Page 5 (0-indexed)
        })),
        getRowCount: vi.fn(() => 45),
        getPageCount: vi.fn(() => 5),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Showing 41 to 45 of 45 entries')).toBeInTheDocument();
    });

    it('handles empty table correctly', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 0, pageSize: 10 },
        })),
        getRowCount: vi.fn(() => 0),
        getPageCount: vi.fn(() => 0),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
    });
  });

  describe('Navigation Button States', () => {
    it('disables first and previous buttons on first page', () => {
      const table = createMockTable({
        getCanPreviousPage: vi.fn(() => false),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const firstButton = buttons[0]; // First button should be "go to first page"
      const previousButton = buttons[1]; // Second button should be "go to previous page"

      expect(firstButton).toBeDisabled();
      expect(previousButton).toBeDisabled();
    });

    it('enables first and previous buttons when not on first page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 },
        })),
        getCanPreviousPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const firstButton = buttons[0];
      const previousButton = buttons[1];

      expect(firstButton).not.toBeDisabled();
      expect(previousButton).not.toBeDisabled();
    });

    it('disables next and last buttons on last page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 4, pageSize: 10 },
        })),
        getCanNextPage: vi.fn(() => false),
        getPageCount: vi.fn(() => 5),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      // Find the last two buttons (next and last)
      const nextButton = buttons[buttons.length - 2];
      const lastButton = buttons[buttons.length - 1];

      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });

    it('enables next and last buttons when not on last page', () => {
      const table = createMockTable({
        getCanNextPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const nextButton = buttons[buttons.length - 2];
      const lastButton = buttons[buttons.length - 1];

      expect(nextButton).not.toBeDisabled();
      expect(lastButton).not.toBeDisabled();
    });
  });

  describe('Navigation Actions', () => {
    it('calls firstPage when first page button is clicked', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 },
        })),
        getCanPreviousPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const firstButton = buttons[0];
      fireEvent.click(firstButton);

      expect(table.firstPage).toHaveBeenCalled();
    });

    it('calls previousPage when previous button is clicked', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 },
        })),
        getCanPreviousPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const previousButton = buttons[1];
      fireEvent.click(previousButton);

      expect(table.previousPage).toHaveBeenCalled();
    });

    it('calls nextPage when next button is clicked', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const nextButton = buttons[buttons.length - 2];
      fireEvent.click(nextButton);

      expect(table.nextPage).toHaveBeenCalled();
    });

    it('calls lastPage when last button is clicked', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const lastButton = buttons[buttons.length - 1];
      fireEvent.click(lastButton);

      expect(table.lastPage).toHaveBeenCalled();
    });

    it('calls setPageIndex when page number is clicked', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      // Find page number buttons (skip first two nav buttons and last two nav buttons)
      const pageButtons = buttons.slice(2, -2);

      // Click on page 3 (should call setPageIndex with 2, since 0-indexed)
      if (pageButtons.length >= 3) {
        fireEvent.click(pageButtons[2]);
        expect(table.setPageIndex).toHaveBeenCalledWith(2);
      }
    });
  });

  describe('Page Number Generation', () => {
    it('shows pages 1-5 when on first page with many pages', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 20),
      });
      render(<TablePagination table={table as Table<any>} />);

      // Check that we have page buttons for 1, 2, 3, 4, 5
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows correct pages when on middle page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 9, pageSize: 10 }, // Page 10 (0-indexed)
        })),
        getPageCount: vi.fn(() => 20),
      });
      render(<TablePagination table={table as Table<any>} />);

      // Should show pages 8, 9, 10, 11, 12 (centered around page 10)
      // Use more specific selectors to avoid conflicts with select dropdown
      const buttons = screen.getAllByTestId('button');
      const pageButtons = buttons.slice(2, -2); // Skip navigation buttons

      expect(pageButtons.some((btn) => btn.textContent === '8')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '9')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '10')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '11')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '12')).toBe(true);
    });

    it('shows last 5 pages when near the end', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 19, pageSize: 10 }, // Page 20 (0-indexed)
        })),
        getPageCount: vi.fn(() => 20),
      });
      render(<TablePagination table={table as Table<any>} />);

      // Should show pages 16, 17, 18, 19, 20
      // Use specific selectors to avoid conflicts with select dropdown
      const buttons = screen.getAllByTestId('button');
      const pageButtons = buttons.slice(2, -2); // Skip navigation buttons

      expect(pageButtons.some((btn) => btn.textContent === '16')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '17')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '18')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '19')).toBe(true);
      expect(pageButtons.some((btn) => btn.textContent === '20')).toBe(true);
    });

    it('shows all pages when total pages <= 5', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 3),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.queryByText('4')).not.toBeInTheDocument();
    });
  });

  describe('Current Page Styling', () => {
    it('highlights current page button', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // Page 3 (0-indexed)
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      // Find the button with text "3"
      const currentPageButton = buttons.find((button) => button.textContent === '3');

      expect(currentPageButton).toHaveAttribute('data-variant', 'default');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('does not highlight non-current page buttons', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // Page 3 (0-indexed)
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      // Find the button with text "1"
      const nonCurrentPageButton = buttons.find((button) => button.textContent === '1');

      expect(nonCurrentPageButton).toHaveAttribute('data-variant', 'outline');
      expect(nonCurrentPageButton).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels for navigation buttons', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      const firstButton = buttons[0];
      const previousButton = buttons[1];
      const nextButton = buttons[buttons.length - 2];
      const lastButton = buttons[buttons.length - 1];

      expect(firstButton).toHaveAttribute('aria-label', 'Go to first page');
      expect(previousButton).toHaveAttribute('aria-label', 'Go to previous page');
      expect(nextButton).toHaveAttribute('aria-label', 'Go to next page');
      expect(lastButton).toHaveAttribute('aria-label', 'Go to last page');
    });

    it('has proper aria labels for page number buttons', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      const buttons = screen.getAllByTestId('button');
      // Find page number buttons and check their aria labels
      const pageButtons = buttons.slice(2, -2);

      if (pageButtons.length >= 1) {
        expect(pageButtons[0]).toHaveAttribute('aria-label', 'Go to page 1');
      }
      if (pageButtons.length >= 2) {
        expect(pageButtons[1]).toHaveAttribute('aria-label', 'Go to page 2');
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles single page scenario', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 1),
        getRowCount: vi.fn(() => 5),
        getCanPreviousPage: vi.fn(() => false),
        getCanNextPage: vi.fn(() => false),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Showing 1 to 5 of 5 entries')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();

      // All navigation buttons should be disabled
      const buttons = screen.getAllByTestId('button');
      const firstButton = buttons[0];
      const previousButton = buttons[1];
      const nextButton = buttons[buttons.length - 2];
      const lastButton = buttons[buttons.length - 1];

      expect(firstButton).toBeDisabled();
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });

    it('handles zero pages scenario', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 0),
        getRowCount: vi.fn(() => 0),
      });
      render(<TablePagination table={table as Table<any>} />);

      expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
      // Should show no page number buttons
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('applies custom className', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} className="custom-class" />);

      const container = document.querySelector('[data-slot="table-pagination"]');
      expect(container).toHaveClass('custom-class');
    });

    it('passes through additional props', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} data-test="custom-prop" />);

      const container = document.querySelector('[data-slot="table-pagination"]');
      expect(container).toHaveAttribute('data-test', 'custom-prop');
    });
  });
});
