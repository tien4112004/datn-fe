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
  ChevronLeft: () => <span aria-hidden="true">‹</span>,
  ChevronRight: () => <span aria-hidden="true">›</span>,
  ChevronsLeft: () => <span aria-hidden="true">«</span>,
  ChevronsRight: () => <span aria-hidden="true">»</span>,
}));

// Mock the pagination components with more realistic behavior
vi.mock('@ui/pagination', () => ({
  Pagination: ({ children, className }) => (
    <nav className={className} role="navigation" aria-label="Pagination">
      {children}
    </nav>
  ),
  PaginationContent: ({ children }) => <ul>{children}</ul>,
  PaginationItem: ({ children }) => <li>{children}</li>,
  PaginationLink: ({ children, onClick, isActive, ...props }) => (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive}
      {...props}
    >
      {children}
    </button>
  ),
  PaginationNext: ({ onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      Next ›
    </button>
  ),
  PaginationPrevious: ({ onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      ‹ Previous
    </button>
  ),
  PaginationEllipsis: () => <span aria-hidden="true">...</span>,
  PaginationStart: ({ onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      « First
    </button>
  ),
  PaginationEnd: ({ onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      Last »
    </button>
  ),
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

  describe('User Experience', () => {
    it('shows clear pagination information to users', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      // User can see how many entries are shown and total count
      expect(screen.getByText('Showing 1 to 10 of 45 entries')).toBeInTheDocument();

      // User can see page size selector
      expect(screen.getByText('Rows per page')).toBeInTheDocument();

      // User can see navigation controls
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });

    it('provides accessible navigation controls', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      // User should see clear navigation with meaningful labels for screen readers
      expect(screen.getByRole('button', { name: /go to first page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to last page/i })).toBeInTheDocument();

      // Page numbers should be accessible with descriptive labels
      expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument();

      // Users should see the pagination navigation area
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });
  });

  describe('Page Size Customization', () => {
    it('allows users to change how many items they see per page', () => {
      const setPageSizeMock = vi.fn();
      const setPageIndexMock = vi.fn();
      const table = createMockTable({
        setPageSize: setPageSizeMock,
        setPageIndex: setPageIndexMock,
        getState: vi.fn(() => ({
          pagination: { pageIndex: 0, pageSize: 10 },
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User should see clear labeling and page size options
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      const pageSizeSelect = screen.getByTestId('select');
      expect(pageSizeSelect).toBeInTheDocument();

      // When user interacts with page size selector, the component should respond
      fireEvent.click(pageSizeSelect);

      // Test should verify user can see page size options (through mocked select)
      expect(screen.getAllByTestId('select-item').length).toBeGreaterThan(0);
    });

    it('provides various page size options for user flexibility', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      // User should see page size selector with various options available
      expect(screen.getByText('Rows per page')).toBeInTheDocument();

      // User should see multiple page size options when interacting with selector
      const selectItems = screen.getAllByTestId('select-item');
      expect(selectItems.length).toBeGreaterThan(1);

      // Common page sizes should be available for user choice
      expect(selectItems.some((item) => item.textContent === '10')).toBe(true);
      expect(selectItems.some((item) => item.textContent === '20')).toBe(true);
      expect(selectItems.some((item) => item.textContent === '50')).toBe(true);
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

      // On first page, users cannot go backwards - buttons should be disabled/inactive
      const firstButton = screen.getByRole('button', { name: /go to first page/i });
      const previousButton = screen.getByRole('button', { name: /go to previous page/i });

      // These buttons should be disabled to prevent users from going further back
      expect(firstButton).toHaveClass('pointer-events-none opacity-50');
      expect(previousButton).toHaveClass('pointer-events-none opacity-50');
    });

    it('enables first and previous buttons when not on first page', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 },
        })),
        getCanPreviousPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      // When user is not on first page, navigation backwards should be available
      const firstButton = screen.getByRole('button', { name: /go to first page/i });
      const previousButton = screen.getByRole('button', { name: /go to previous page/i });

      // These buttons should be active and clickable
      expect(firstButton).not.toHaveClass('pointer-events-none opacity-50');
      expect(previousButton).not.toHaveClass('pointer-events-none opacity-50');
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

      // On last page, users cannot go forward - buttons should be disabled/inactive
      const nextButton = screen.getByRole('button', { name: /go to next page/i });
      const lastButton = screen.getByRole('button', { name: /go to last page/i });

      // These buttons should be disabled to prevent users from going further forward
      expect(nextButton).toHaveClass('pointer-events-none opacity-50');
      expect(lastButton).toHaveClass('pointer-events-none opacity-50');
    });

    it('enables next and last buttons when not on last page', () => {
      const table = createMockTable({
        getCanNextPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      // When user is not on last page, navigation forward should be available
      const nextButton = screen.getByRole('button', { name: /go to next page/i });
      const lastButton = screen.getByRole('button', { name: /go to last page/i });

      // These buttons should be active and clickable
      expect(nextButton).not.toHaveClass('pointer-events-none opacity-50');
      expect(lastButton).not.toHaveClass('pointer-events-none opacity-50');
    });
  });

  describe('Navigation Workflow', () => {
    it('enables users to navigate through multiple pages', () => {
      const firstPageMock = vi.fn();
      const previousPageMock = vi.fn();
      const nextPageMock = vi.fn();
      const lastPageMock = vi.fn();

      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // User is on page 3
        })),
        getCanPreviousPage: vi.fn(() => true),
        getCanNextPage: vi.fn(() => true),
        firstPage: firstPageMock,
        previousPage: previousPageMock,
        nextPage: nextPageMock,
        lastPage: lastPageMock,
      });
      render(<TablePagination table={table as Table<any>} />);

      // User can go to first page
      const firstButton = screen.getByRole('button', { name: /first/i });
      expect(firstButton).not.toBeDisabled();
      fireEvent.click(firstButton);
      expect(firstPageMock).toHaveBeenCalled();

      // User can go to previous page
      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).not.toBeDisabled();
      fireEvent.click(previousButton);
      expect(previousPageMock).toHaveBeenCalled();

      // User can go to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).not.toBeDisabled();
      fireEvent.click(nextButton);
      expect(nextPageMock).toHaveBeenCalled();

      // User can go to last page
      const lastButton = screen.getByRole('button', { name: /last/i });
      expect(lastButton).not.toBeDisabled();
      fireEvent.click(lastButton);
      expect(lastPageMock).toHaveBeenCalled();
    });

    it('allows direct navigation to specific pages', () => {
      const setPageIndexMock = vi.fn();
      const table = createMockTable({
        setPageIndex: setPageIndexMock,
      });
      render(<TablePagination table={table as Table<any>} />);

      // User can click on page numbers to jump directly
      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);
      expect(setPageIndexMock).toHaveBeenCalledWith(1); // 0-indexed

      const page3Button = screen.getByRole('button', { name: /go to page 3/i });
      fireEvent.click(page3Button);
      expect(setPageIndexMock).toHaveBeenCalledWith(2);
    });

    it('shows current page state clearly to users', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 1, pageSize: 10 }, // Page 2
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      // Current page should be highlighted/indicated
      const currentPageButton = screen.getByRole('button', { name: /go to page 2/i });
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Page Number Generation', () => {
    it('shows reasonable page options when user is on first page with many pages', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 20),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User should see current page is clearly indicated
      expect(screen.getByRole('button', { name: /go to page 1/i })).toHaveAttribute('aria-current', 'page');

      // User should see some nearby pages available for navigation (not all 20)
      const pageButtons = screen
        .getAllByRole('button')
        .filter((button) => button.getAttribute('aria-label')?.includes('Go to page'));
      expect(pageButtons.length).toBeGreaterThan(3); // Should show several page options
      expect(pageButtons.length).toBeLessThan(10); // But not overwhelm with all 20

      // User should see forward navigation options
      expect(screen.getByRole('button', { name: /go to next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to last page/i })).toBeInTheDocument();
    });

    it('provides relevant page navigation when user is in the middle of many pages', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 9, pageSize: 10 }, // Page 10 (0-indexed)
        })),
        getPageCount: vi.fn(() => 20),
        getCanPreviousPage: vi.fn(() => true),
        getCanNextPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User should see current page and nearby options
      expect(screen.getByRole('button', { name: /go to page 10/i })).toHaveAttribute('aria-current', 'page');

      // User should have navigation options in both directions
      expect(screen.getByRole('button', { name: /go to previous page/i })).not.toHaveClass(
        'pointer-events-none'
      );
      expect(screen.getByRole('button', { name: /go to next page/i })).not.toHaveClass('pointer-events-none');

      // User should see navigation to first and last pages
      expect(screen.getByRole('button', { name: /go to first page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to last page/i })).toBeInTheDocument();
    });

    it('provides appropriate navigation when user is near the end of many pages', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 19, pageSize: 10 }, // Page 20 (0-indexed)
        })),
        getPageCount: vi.fn(() => 20),
        getCanNextPage: vi.fn(() => false),
        getCanPreviousPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User is on the last page, should see current page indicated
      expect(screen.getByRole('button', { name: /go to page 20/i })).toHaveAttribute('aria-current', 'page');

      // User should not be able to go forward from last page
      expect(screen.getByRole('button', { name: /go to next page/i })).toHaveClass(
        'pointer-events-none opacity-50'
      );
      expect(screen.getByRole('button', { name: /go to last page/i })).toHaveClass(
        'pointer-events-none opacity-50'
      );

      // User should be able to go backwards
      expect(screen.getByRole('button', { name: /go to previous page/i })).not.toHaveClass(
        'pointer-events-none'
      );
      expect(screen.getByRole('button', { name: /go to first page/i })).not.toHaveClass(
        'pointer-events-none'
      );
    });

    it('shows all available pages when there are few pages', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 3),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User should see all available pages when there are only a few
      expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to page 3/i })).toBeInTheDocument();

      // No page 4 should exist
      expect(screen.queryByRole('button', { name: /go to page 4/i })).not.toBeInTheDocument();
    });
  });

  describe('Current Page Styling', () => {
    it('clearly indicates which page user is currently viewing', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // Page 3 (0-indexed)
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      // Current page should be clearly marked for screen readers and visual users
      const currentPageButton = screen.getByRole('button', { name: /go to page 3/i });
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
      expect(currentPageButton).toHaveAttribute('data-active', 'true');
    });

    it('shows non-current pages as navigable options', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // Page 3 (0-indexed)
        })),
      });
      render(<TablePagination table={table as Table<any>} />);

      // Other pages should be clickable but not marked as current
      const page1Button = screen.getByRole('button', { name: /go to page 1/i });
      expect(page1Button).not.toHaveAttribute('aria-current', 'page');
      expect(page1Button).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Accessibility', () => {
    it('provides clear navigation labels for screen readers', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      // All navigation buttons should have descriptive labels for screen readers
      expect(screen.getByRole('button', { name: /go to first page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to last page/i })).toBeInTheDocument();
    });

    it('provides clear page number labels for screen readers', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      // Page number buttons should have descriptive labels
      expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument();

      // Pagination should be properly labeled for screen readers
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });
  });

  describe('Real-World User Scenarios', () => {
    it('provides clear guidance when there is only one page of data', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 1),
        getRowCount: vi.fn(() => 5),
        getCanPreviousPage: vi.fn(() => false),
        getCanNextPage: vi.fn(() => false),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User sees clear information about the data
      expect(screen.getByText('Showing 1 to 5 of 5 entries')).toBeInTheDocument();

      // Only page 1 is available since there's only one page
      expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /go to page 2/i })).not.toBeInTheDocument();

      // Navigation buttons should indicate no further navigation is possible
      expect(screen.getByRole('button', { name: /go to first page/i })).toHaveClass(
        'pointer-events-none opacity-50'
      );
      expect(screen.getByRole('button', { name: /go to previous page/i })).toHaveClass(
        'pointer-events-none opacity-50'
      );
      expect(screen.getByRole('button', { name: /go to next page/i })).toHaveClass(
        'pointer-events-none opacity-50'
      );
      expect(screen.getByRole('button', { name: /go to last page/i })).toHaveClass(
        'pointer-events-none opacity-50'
      );
    });

    it('handles empty data gracefully', () => {
      const table = createMockTable({
        getPageCount: vi.fn(() => 0),
        getRowCount: vi.fn(() => 0),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User sees clear information about empty state
      expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();

      // No page numbers shown when there's no data
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('supports keyboard navigation for accessibility', () => {
      const table = createMockTable();
      render(<TablePagination table={table as Table<any>} />);

      // All interactive elements should be keyboard accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInstanceOf(HTMLButtonElement);
      });

      // Page size selector should be accessible for keyboard users
      const select = screen.getByTestId('select');
      expect(select).toBeInTheDocument();

      // Navigation should be clearly labeled for keyboard users
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    });

    it('provides comprehensive pagination experience', () => {
      const table = createMockTable({
        getState: vi.fn(() => ({
          pagination: { pageIndex: 2, pageSize: 10 }, // Page 3 of 5
        })),
        getCanPreviousPage: vi.fn(() => true),
        getCanNextPage: vi.fn(() => true),
      });
      render(<TablePagination table={table as Table<any>} />);

      // User can see where they are in the data set
      expect(screen.getByText('Showing 21 to 30 of 45 entries')).toBeInTheDocument();

      // User can see current page and navigation options
      expect(screen.getByRole('button', { name: /go to page 3/i })).toHaveAttribute('aria-current', 'page');

      // User has full navigation control from middle page
      expect(screen.getByRole('button', { name: /go to first page/i })).not.toHaveClass(
        'pointer-events-none'
      );
      expect(screen.getByRole('button', { name: /go to previous page/i })).not.toHaveClass(
        'pointer-events-none'
      );
      expect(screen.getByRole('button', { name: /go to next page/i })).not.toHaveClass('pointer-events-none');
      expect(screen.getByRole('button', { name: /go to last page/i })).not.toHaveClass('pointer-events-none');

      // User can also control page size
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
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
