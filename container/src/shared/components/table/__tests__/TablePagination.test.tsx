import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import TablePagination from '../TablePagination';

// Essential mocks only - keep real component behavior
const mockUseTranslation = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => mockUseTranslation(namespace),
}));

vi.mock('@/shared/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

interface TestData {
  id: number;
  name: string;
  email: string;
}

const generateTestData = (count: number): TestData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));
};

const columnHelper = createColumnHelper<TestData>();
const columns = [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
];

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
      firstPage: 'First',
      previous: 'Previous',
      next: 'Next',
      lastPage: 'Last',
    };
    return translations[key] || key;
  });

  const createTableWithData = (data: TestData[], initialPageSize = 10) => {
    return useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      initialState: {
        pagination: {
          pageSize: initialPageSize,
        },
      },
    });
  };

  const TableTestWrapper = ({
    data,
    pageSize = 10,
    children,
  }: {
    data: TestData[];
    pageSize?: number;
    children?: (table: ReturnType<typeof createTableWithData>) => React.ReactElement;
  }) => {
    const table = createTableWithData(data, pageSize);
    return children ? children(table) : <TablePagination table={table} />;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });
  });

  describe('User Workflows: Browsing Through Data', () => {
    it('displays clear information about data range and total count', async () => {
      const testData = generateTestData(45);
      render(<TableTestWrapper data={testData} />);

      // User can see exactly what data is displayed and how much total exists
      expect(screen.getByText('Showing 1 to 10 of 45 entries')).toBeInTheDocument();
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();
    });

    it('provides full keyboard and screen reader accessibility', async () => {
      const testData = generateTestData(25);
      render(<TableTestWrapper data={testData} />);

      // All navigation elements should be properly labeled and keyboard accessible
      const firstPageButton = screen.getByLabelText(/go to first page/i);
      const prevPageButton = screen.getByLabelText(/go to previous page/i);
      const nextPageButton = screen.getByLabelText(/go to next page/i);
      const lastPageButton = screen.getByLabelText(/go to last page/i);

      expect(firstPageButton).toBeInTheDocument();
      expect(prevPageButton).toBeInTheDocument();
      expect(nextPageButton).toBeInTheDocument();
      expect(lastPageButton).toBeInTheDocument();

      // Current page should be clearly indicated
      const currentPageButton = screen.getByLabelText(/go to page 1/i);
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');

      // Navigation area should be properly labeled
      expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();
    });
  });

  describe('User Workflow: Customizing Data View', () => {
    it('shows page size selector and allows customization workflow', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(100);

      render(<TableTestWrapper data={testData} />);

      // Initially showing first 10 items
      expect(screen.getByText('Showing 1 to 10 of 100 entries')).toBeInTheDocument();

      // Navigate to page 3 first
      const page3Button = screen.getByLabelText(/go to page 3/i);
      await user.click(page3Button);
      expect(screen.getByText('Showing 21 to 30 of 100 entries')).toBeInTheDocument();

      // Page size selector should be present and labeled
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      const pageSizeSelect = screen.getByRole('combobox');
      expect(pageSizeSelect).toBeInTheDocument();

      // Test with a different page size initially
      render(<TableTestWrapper data={testData} pageSize={20} />);
      expect(screen.getByText('Showing 1 to 20 of 100 entries')).toBeInTheDocument();
    });

    it('provides page size selector with proper labeling', () => {
      const testData = generateTestData(100);

      render(<TableTestWrapper data={testData} />);

      // Page size selector should be accessible and labeled
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      const pageSizeSelect = screen.getByRole('combobox');
      expect(pageSizeSelect).toBeInTheDocument();
      expect(pageSizeSelect).toHaveAttribute('aria-expanded');

      // Test different initial page sizes work
      render(<TableTestWrapper data={testData} pageSize={5} />);
      expect(screen.getByText('Showing 1 to 5 of 100 entries')).toBeInTheDocument();

      render(<TableTestWrapper data={testData} pageSize={20} />);
      expect(screen.getByText('Showing 1 to 20 of 100 entries')).toBeInTheDocument();
    });
  });

  describe('Data Range Information Accuracy', () => {
    it('correctly displays entry range for first page', () => {
      const testData = generateTestData(45);
      render(<TableTestWrapper data={testData} />);

      expect(screen.getByText('Showing 1 to 10 of 45 entries')).toBeInTheDocument();
    });

    it('correctly calculates entry range after navigation', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(45);
      render(<TableTestWrapper data={testData} />);

      // Navigate to page 3
      const page3Button = screen.getByLabelText(/go to page 3/i);
      await user.click(page3Button);

      expect(screen.getByText('Showing 21 to 30 of 45 entries')).toBeInTheDocument();
    });

    it('correctly displays partial last page', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(45); // 5 pages, last page has 5 items
      render(<TableTestWrapper data={testData} />);

      // Navigate to last page
      const lastPageButton = screen.getByLabelText(/go to last page/i);
      await user.click(lastPageButton);

      expect(screen.getByText('Showing 41 to 45 of 45 entries')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      const testData: TestData[] = [];
      render(<TableTestWrapper data={testData} />);

      expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
    });
  });

  describe('User Workflow: Navigation Behavior', () => {
    it('prevents backward navigation on first page but allows forward navigation', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(50);
      render(<TableTestWrapper data={testData} />);

      // On first page, backward navigation should not be functional
      const firstButton = screen.getByLabelText(/go to first page/i);
      const previousButton = screen.getByLabelText(/go to previous page/i);

      // Clicking these should not change the page (they're visually disabled)
      await user.click(firstButton);
      await user.click(previousButton);
      expect(screen.getByText('Showing 1 to 10 of 50 entries')).toBeInTheDocument();

      // Forward navigation should work
      const nextButton = screen.getByLabelText(/go to next page/i);
      await user.click(nextButton);
      expect(screen.getByText('Showing 11 to 20 of 50 entries')).toBeInTheDocument();
    });

    it('allows backward navigation when not on first page', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(50);
      render(<TableTestWrapper data={testData} />);

      // Navigate to page 3 first
      const page3Button = screen.getByLabelText(/go to page 3/i);
      await user.click(page3Button);
      expect(screen.getByText('Showing 21 to 30 of 50 entries')).toBeInTheDocument();

      // Now backward navigation should work
      const previousButton = screen.getByLabelText(/go to previous page/i);
      await user.click(previousButton);
      expect(screen.getByText('Showing 11 to 20 of 50 entries')).toBeInTheDocument();

      const firstButton = screen.getByLabelText(/go to first page/i);
      await user.click(firstButton);
      expect(screen.getByText('Showing 1 to 10 of 50 entries')).toBeInTheDocument();
    });

    it('prevents forward navigation on last page but allows backward navigation', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(50);
      render(<TableTestWrapper data={testData} />);

      // Navigate to last page
      const lastButton = screen.getByLabelText(/go to last page/i);
      await user.click(lastButton);
      expect(screen.getByText('Showing 41 to 50 of 50 entries')).toBeInTheDocument();

      // Forward navigation should not work (clicks have no effect)
      const nextButton = screen.getByLabelText(/go to next page/i);
      await user.click(nextButton);
      await user.click(lastButton); // Try clicking last again
      expect(screen.getByText('Showing 41 to 50 of 50 entries')).toBeInTheDocument(); // Still on last page

      // Backward navigation should work
      const previousButton = screen.getByLabelText(/go to previous page/i);
      await user.click(previousButton);
      expect(screen.getByText('Showing 31 to 40 of 50 entries')).toBeInTheDocument();
    });
  });

  describe('Complete Navigation User Journey', () => {
    it('allows users to navigate through all pages using all controls', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(50); // 5 pages
      render(<TableTestWrapper data={testData} />);

      // Start on page 1
      expect(screen.getByText('Showing 1 to 10 of 50 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 1/i)).toHaveAttribute('aria-current', 'page');

      // Navigate to next page
      await user.click(screen.getByLabelText(/go to next page/i));
      expect(screen.getByText('Showing 11 to 20 of 50 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 2/i)).toHaveAttribute('aria-current', 'page');

      // Jump directly to page 4
      await user.click(screen.getByLabelText(/go to page 4/i));
      expect(screen.getByText('Showing 31 to 40 of 50 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 4/i)).toHaveAttribute('aria-current', 'page');

      // Go to last page
      await user.click(screen.getByLabelText(/go to last page/i));
      expect(screen.getByText('Showing 41 to 50 of 50 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 5/i)).toHaveAttribute('aria-current', 'page');

      // Go back to first page
      await user.click(screen.getByLabelText(/go to first page/i));
      expect(screen.getByText('Showing 1 to 10 of 50 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 1/i)).toHaveAttribute('aria-current', 'page');
    });

    it('enables direct page number navigation and shows current page clearly', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(30); // 3 pages
      render(<TableTestWrapper data={testData} />);

      // Initially on page 1
      const page1Button = screen.getByLabelText(/go to page 1/i);
      expect(page1Button).toHaveAttribute('aria-current', 'page');

      // Click page 2 directly
      const page2Button = screen.getByLabelText(/go to page 2/i);
      await user.click(page2Button);

      expect(screen.getByText('Showing 11 to 20 of 30 entries')).toBeInTheDocument();
      expect(page2Button).toHaveAttribute('aria-current', 'page');
      expect(page1Button).not.toHaveAttribute('aria-current', 'page');

      // Click page 3 directly
      const page3Button = screen.getByLabelText(/go to page 3/i);
      await user.click(page3Button);

      expect(screen.getByText('Showing 21 to 30 of 30 entries')).toBeInTheDocument();
      expect(page3Button).toHaveAttribute('aria-current', 'page');
      expect(page2Button).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Large Dataset Navigation Experience', () => {
    it('provides manageable navigation options with many pages without overwhelming users', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(200); // 20 pages
      render(<TableTestWrapper data={testData} />);

      // User should see current page clearly
      expect(screen.getByLabelText(/go to page 1/i)).toHaveAttribute('aria-current', 'page');

      // Should show manageable number of page options (not all 20)
      // Find all page number buttons by searching for elements with page-related labels
      const allElements = document.querySelectorAll('[aria-label*="Go to page"]');
      const pageButtons = Array.from(allElements);
      expect(pageButtons.length).toBeGreaterThan(3);
      expect(pageButtons.length).toBeLessThanOrEqual(7); // Should be manageable

      // User should always have access to first/last navigation
      expect(screen.getByLabelText(/go to first page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to last page/i)).toBeInTheDocument();

      // Navigate to middle and verify smart page display
      await user.click(screen.getByLabelText(/go to page 3/i));
      expect(screen.getByLabelText(/go to page 3/i)).toHaveAttribute('aria-current', 'page');
    });

    it('maintains good navigation experience in middle of large dataset', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(200); // 20 pages

      render(<TableTestWrapper data={testData} />);

      // Navigate to a few pages forward to get to a middle-ish position
      // Start on page 1, go to next a few times to reach middle
      await user.click(screen.getByLabelText(/go to next page/i));
      expect(screen.getByText('Showing 11 to 20 of 200 entries')).toBeInTheDocument();

      await user.click(screen.getByLabelText(/go to next page/i));
      expect(screen.getByText('Showing 21 to 30 of 200 entries')).toBeInTheDocument();

      await user.click(screen.getByLabelText(/go to next page/i));
      expect(screen.getByText('Showing 31 to 40 of 200 entries')).toBeInTheDocument();

      // Now we're in a middle position with navigation options in both directions
      const prevButton = screen.getByLabelText(/go to previous page/i);
      const nextButton = screen.getByLabelText(/go to next page/i);
      const firstButton = screen.getByLabelText(/go to first page/i);
      const lastButton = screen.getByLabelText(/go to last page/i);

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(firstButton).toBeInTheDocument();
      expect(lastButton).toBeInTheDocument();

      // Verify we can navigate in both directions
      await user.click(prevButton);
      expect(screen.getByText('Showing 21 to 30 of 200 entries')).toBeInTheDocument();

      await user.click(nextButton);
      expect(screen.getByText('Showing 31 to 40 of 200 entries')).toBeInTheDocument();
    });

    it('shows all pages when dataset is small', () => {
      const testData = generateTestData(25); // 3 pages with 10 per page
      render(<TableTestWrapper data={testData} />);

      // All pages should be visible when there are few
      expect(screen.getByLabelText(/go to page 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 3/i)).toBeInTheDocument();

      // No additional pages should exist
      expect(screen.queryByLabelText(/go to page 4/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience Integration', () => {
    it('maintains clear current page indication throughout navigation', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(40);
      render(<TableTestWrapper data={testData} />);

      // Initially on page 1
      const page1Button = screen.getByLabelText(/go to page 1/i);
      expect(page1Button).toHaveAttribute('aria-current', 'page');

      // Navigate to page 3 and verify current page indication
      const page3Button = screen.getByLabelText(/go to page 3/i);
      await user.click(page3Button);

      expect(page3Button).toHaveAttribute('aria-current', 'page');
      expect(page1Button).not.toHaveAttribute('aria-current', 'page');

      // Navigate to page 2 and verify again
      const page2Button = screen.getByLabelText(/go to page 2/i);
      await user.click(page2Button);

      expect(page2Button).toHaveAttribute('aria-current', 'page');
      expect(page3Button).not.toHaveAttribute('aria-current', 'page');
    });

    it('provides comprehensive keyboard and screen reader support', () => {
      const testData = generateTestData(30);
      render(<TableTestWrapper data={testData} />);

      // All navigation controls should be properly labeled
      expect(screen.getByLabelText(/go to first page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to next page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to last page/i)).toBeInTheDocument();

      // Page number controls should have clear labels
      expect(screen.getByLabelText(/go to page 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 2/i)).toBeInTheDocument();

      // Main navigation should be properly identified
      expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();

      // Page size selector should be accessible
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Real-World Integration Scenarios', () => {
    it('handles single page datasets gracefully with appropriate UI feedback', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(5); // Only 5 items, single page
      render(<TableTestWrapper data={testData} />);

      // User sees accurate information about the limited data
      expect(screen.getByText('Showing 1 to 5 of 5 entries')).toBeInTheDocument();

      // Only page 1 should be shown
      expect(screen.getByLabelText(/go to page 1/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/go to page 2/i)).not.toBeInTheDocument();

      // Navigation buttons should not perform any action when clicked
      const nextButton = screen.getByLabelText(/go to next page/i);
      const firstButton = screen.getByLabelText(/go to first page/i);

      await user.click(nextButton);
      await user.click(firstButton);

      // Should still show the same data (no navigation occurred)
      expect(screen.getByText('Showing 1 to 5 of 5 entries')).toBeInTheDocument();
    });

    it('handles completely empty datasets with clear messaging', () => {
      const testData: TestData[] = [];
      render(<TableTestWrapper data={testData} />);

      // User sees clear indication of no data
      expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();

      // No page navigation should be available
      expect(screen.queryByLabelText(/go to page 1/i)).not.toBeInTheDocument();

      // But pagination controls should still be present (just inactive)
      expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();
    });

    it('supports complete keyboard navigation workflow', async () => {
      const testData = generateTestData(30);
      render(<TableTestWrapper data={testData} />);

      // Verify all navigation elements are accessible via aria-labels
      const firstPageElement = screen.getByLabelText(/go to first page/i);
      const prevPageElement = screen.getByLabelText(/go to previous page/i);
      const nextPageElement = screen.getByLabelText(/go to next page/i);
      const lastPageElement = screen.getByLabelText(/go to last page/i);

      // All navigation elements should be anchor tags (keyboard accessible)
      expect(firstPageElement.tagName).toBe('A');
      expect(prevPageElement.tagName).toBe('A');
      expect(nextPageElement.tagName).toBe('A');
      expect(lastPageElement.tagName).toBe('A');

      // Page size selector should be accessible as a button
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
      expect(combobox.tagName).toBe('BUTTON');

      // Navigation landmark should be clearly identified
      expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();

      // Verify page number elements are also accessible
      const page1Element = screen.getByLabelText(/go to page 1/i);
      const page2Element = screen.getByLabelText(/go to page 2/i);
      expect(page1Element.tagName).toBe('A');
      expect(page2Element.tagName).toBe('A');
    });

    it('provides complete user experience from middle page position', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(50); // 5 pages
      render(<TableTestWrapper data={testData} />);

      // Navigate to middle page (page 3)
      await user.click(screen.getByLabelText(/go to page 3/i));

      // User can see their position in the dataset
      expect(screen.getByText('Showing 21 to 30 of 50 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 3/i)).toHaveAttribute('aria-current', 'page');

      // All navigation options should be available from middle position
      const firstButton = screen.getByLabelText(/go to first page/i);
      const prevButton = screen.getByLabelText(/go to previous page/i);
      const nextButton = screen.getByLabelText(/go to next page/i);
      const lastButton = screen.getByLabelText(/go to last page/i);

      // Test that all navigation works
      await user.click(nextButton);
      expect(screen.getByText('Showing 31 to 40 of 50 entries')).toBeInTheDocument();

      await user.click(prevButton);
      expect(screen.getByText('Showing 21 to 30 of 50 entries')).toBeInTheDocument();

      await user.click(firstButton);
      expect(screen.getByText('Showing 1 to 10 of 50 entries')).toBeInTheDocument();

      await user.click(lastButton);
      expect(screen.getByText('Showing 41 to 50 of 50 entries')).toBeInTheDocument();

      // User can also change page size from any position
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Component Integration and Customization', () => {
    it('applies custom styling and props correctly', () => {
      const testData = generateTestData(20);
      render(
        <TableTestWrapper data={testData}>
          {(table) => <TablePagination table={table} className="custom-class" data-test="custom-prop" />}
        </TableTestWrapper>
      );

      const container = document.querySelector('[data-slot="table-pagination"]');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveAttribute('data-test', 'custom-prop');
    });

    it('integrates properly with different page sizes and maintains functionality', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(100);

      render(<TableTestWrapper data={testData} pageSize={20} />);

      // Should start with custom page size
      expect(screen.getByText('Showing 1 to 20 of 100 entries')).toBeInTheDocument();

      // Navigation should work with custom page size
      await user.click(screen.getByLabelText(/go to page 2/i));
      expect(screen.getByText('Showing 21 to 40 of 100 entries')).toBeInTheDocument();

      // Page size change should still work
      const pageSizeSelect = screen.getByRole('combobox');
      await user.click(pageSizeSelect);
      await user.click(screen.getByRole('option', { name: '10' }));

      expect(screen.getByText('Showing 1 to 10 of 100 entries')).toBeInTheDocument();
    });
  });

  describe('End-to-End User Journey Integration', () => {
    it('supports complete data exploration workflow', async () => {
      const user = userEvent.setup();
      const testData = generateTestData(127); // Odd number to test edge cases

      render(<TableTestWrapper data={testData} />);

      // User starts exploring data
      expect(screen.getByText('Showing 1 to 10 of 127 entries')).toBeInTheDocument();

      // User can see page size controls
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();

      // User navigates through pages
      await user.click(screen.getByLabelText(/go to next page/i));
      expect(screen.getByText('Showing 11 to 20 of 127 entries')).toBeInTheDocument();

      // User wants to see the end
      await user.click(screen.getByLabelText(/go to last page/i));
      expect(screen.getByText('Showing 121 to 127 of 127 entries')).toBeInTheDocument(); // Partial last page

      // User goes back to beginning
      await user.click(screen.getByLabelText(/go to first page/i));
      expect(screen.getByText('Showing 1 to 10 of 127 entries')).toBeInTheDocument();

      // Navigate to page 2 to test middle navigation
      await user.click(screen.getByLabelText(/go to page 2/i));
      expect(screen.getByText('Showing 11 to 20 of 127 entries')).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 2/i)).toHaveAttribute('aria-current', 'page');
    });

    it('works with different page sizes', () => {
      const testData = generateTestData(127);

      // Test with page size of 20
      render(<TableTestWrapper data={testData} pageSize={20} />);
      expect(screen.getByText('Showing 1 to 20 of 127 entries')).toBeInTheDocument();

      // Clean up and test with larger page size
    });

    it('works with larger page sizes', () => {
      const testData = generateTestData(127);

      // Test larger page size scenario (50 per page = 3 pages total)
      render(<TableTestWrapper data={testData} pageSize={50} />);
      expect(screen.getByText('Showing 1 to 50 of 127 entries')).toBeInTheDocument();

      // Now there should be fewer pages (3 pages with 50 per page)
      expect(screen.getByLabelText(/go to page 1/i)).toHaveAttribute('aria-current', 'page');
      expect(screen.getByLabelText(/go to page 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to page 3/i)).toBeInTheDocument();
    });
  });
});
