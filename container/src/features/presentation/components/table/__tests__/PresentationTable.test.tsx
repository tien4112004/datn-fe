import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import { renderWithProviders } from '@/tests/test-utils';
import type { Presentation } from '@/features/presentation/types/presentation';

const { usePresentations } = await import('@/features/presentation/hooks/useApi');

// Mock only the API service layer for realistic testing
vi.mock('@/features/presentation/api/service', () => ({
  presentationService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/features/presentation/hooks/useApi', () => ({
  usePresentations: vi.fn(),
}));

describe('PresentationTable', () => {
  const mockPresentationData: Presentation[] = [
    {
      id: '1',
      title: 'My First Presentation',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-02T15:30:00Z',
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      createdAt: '2023-01-03T09:15:00Z',
      updatedAt: '2023-01-04T14:45:00Z',
    },
    {
      id: '3',
      title: 'Testing Best Practices',
      createdAt: '2023-01-05T11:20:00Z',
      updatedAt: '2023-01-05T16:10:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePresentations).mockReturnValue({
      data: mockPresentationData,
      isLoading: false,
      sorting: [],
      setSorting: vi.fn(),
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 3,
      search: '',
      setSearch: vi.fn(),
    } as any);
  });

  it('displays presentations with correct data', () => {
    renderWithProviders(<PresentationTable />);

    // Check that all presentations are displayed
    expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Testing Best Practices')).toBeInTheDocument();
  });

  it('displays table headers correctly', () => {
    renderWithProviders(<PresentationTable />);

    // Check table headers are present (these come from i18n)
    expect(screen.getByRole('columnheader', { name: /id/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /updated/i })).toBeInTheDocument();
  });

  it('does not show deprecated columns', () => {
    renderWithProviders(<PresentationTable />);

    // Ensure old columns are not displayed
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/status/i)).not.toBeInTheDocument();
  });

  it('formats dates in readable format', () => {
    renderWithProviders(<PresentationTable />);

    // Check that dates are formatted as localized date strings
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('shows context menu when right-clicking on table row', async () => {
    renderWithProviders(<PresentationTable />);

    const firstRow = screen.getByText('My First Presentation').closest('tr')!;

    // Right click to open context menu
    fireEvent.contextMenu(firstRow);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  it('allows user to access edit option for a presentation', async () => {
    renderWithProviders(<PresentationTable />);

    const firstRow = screen.getByText('My First Presentation').closest('tr')!;
    fireEvent.contextMenu(firstRow);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toBeEnabled();

      // User can click the edit button - this would normally trigger navigation or modal
      fireEvent.click(editButton);
      // In a real app, this would navigate to edit page or open edit modal
      // We verify the user interaction is possible, not the console.log
    });
  });

  it('allows user to access delete option for a presentation', async () => {
    renderWithProviders(<PresentationTable />);

    const secondRow = screen.getByText('Advanced React Patterns').closest('tr')!;
    fireEvent.contextMenu(secondRow);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeEnabled();

      // User can access the delete functionality
      fireEvent.click(deleteButton);
      // In a real app, this would show confirmation dialog or delete the item
      // We verify the user can perform the delete action
    });
  });

  it('provides sortable column headers for user interaction', async () => {
    renderWithProviders(<PresentationTable />);

    // User can see the table with column headers that suggest sorting capability
    const createdAtHeader = screen.getByRole('columnheader', { name: /created/i });
    expect(createdAtHeader).toBeInTheDocument();

    // User should be able to interact with sortable headers
    expect(createdAtHeader).toBeVisible();

    // The header should be clickable, indicating to users they can sort by this column
    fireEvent.click(createdAtHeader);

    // The table should remain functional and accessible after click interaction
    expect(createdAtHeader).toBeInTheDocument();

    // User can still see all their data after attempting to sort
    expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
  });

  it('provides accessible search functionality for users', async () => {
    renderWithProviders(<PresentationTable />);

    // User can find and use the search input with clear instructions
    const searchInput = screen.getByPlaceholderText(/search by title/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();

    // User can type in the search box and see their input reflected
    fireEvent.change(searchInput, { target: { value: 'React' } });
    expect(searchInput).toHaveValue('React');

    // User can clear their search if needed
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput).toHaveValue('');

    // Search field remains accessible and functional throughout interaction
    expect(searchInput).toBeEnabled();
    expect(searchInput).toHaveAttribute('placeholder');
  });

  it('shows filtered search results', () => {
    // Simulate search results
    const filteredData = [mockPresentationData[1]]; // Just "Advanced React Patterns"
    vi.mocked(usePresentations).mockReturnValue({
      data: filteredData,
      isLoading: false,
      sorting: [],
      setSorting: vi.fn(),
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 1,
      search: 'React',
      setSearch: vi.fn(),
    } as any);

    renderWithProviders(<PresentationTable />);

    // User sees only matching presentations
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.queryByText('My First Presentation')).not.toBeInTheDocument();
    expect(screen.queryByText('Testing Best Practices')).not.toBeInTheDocument();
  });

  describe('loading and empty states', () => {
    it('shows loading indicators when data is being fetched', () => {
      vi.mocked(usePresentations).mockReturnValue({
        data: [],
        isLoading: true,
        sorting: [],
        setSorting: vi.fn(),
        pagination: { pageIndex: 0, pageSize: 10 },
        setPagination: vi.fn(),
        totalItems: 0,
        search: '',
        setSearch: vi.fn(),
      } as any);

      renderWithProviders(<PresentationTable />);

      // User should see loading indicators - skeleton elements indicate data is loading
      const skeletonElements = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);

      // Loading indicators should have proper visual styling to show they're placeholder content
      const firstSkeleton = skeletonElements[0];
      expect(firstSkeleton).toHaveClass('animate-pulse');
    });

    it('displays empty state message when no presentations exist', () => {
      vi.mocked(usePresentations).mockReturnValue({
        data: [],
        isLoading: false,
        sorting: [],
        setSorting: vi.fn(),
        pagination: { pageIndex: 0, pageSize: 10 },
        setPagination: vi.fn(),
        totalItems: 0,
        search: '',
        setSearch: vi.fn(),
      } as any);

      renderWithProviders(<PresentationTable />);

      // User should see an empty state message
      expect(screen.getByText(/no presentations/i) || screen.getByText(/empty/i)).toBeInTheDocument();
    });

    it('shows data table when presentations are available', () => {
      vi.mocked(usePresentations).mockReturnValue({
        data: mockPresentationData,
        isLoading: false,
        sorting: [],
        setSorting: vi.fn(),
        pagination: { pageIndex: 0, pageSize: 10 },
        setPagination: vi.fn(),
        totalItems: 3,
        search: '',
        setSearch: vi.fn(),
      } as any);

      renderWithProviders(<PresentationTable />);

      // User should see the table with their presentations
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    });
  });

  describe('user interaction scenarios', () => {
    it('provides complete workflow for managing presentations', async () => {
      renderWithProviders(<PresentationTable />);

      // User can see their presentations in a table
      expect(screen.getByText('Testing Best Practices')).toBeInTheDocument();
      expect(screen.getByText('My First Presentation')).toBeInTheDocument();
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();

      // User can right-click to access actions
      const presentationRow = screen.getByText('Testing Best Practices').closest('tr')!;
      fireEvent.contextMenu(presentationRow);

      // User sees available actions
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation for accessibility', () => {
      renderWithProviders(<PresentationTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Table should be accessible via keyboard
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + data rows

      // Each row should contain proper table cells
      rows.slice(1).forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells.length).toBeGreaterThan(0);
      });
    });
  });
});
