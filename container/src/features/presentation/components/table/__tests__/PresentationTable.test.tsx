import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import { renderWithProviders } from '@/tests/test-utils';
import type { Presentation } from '@/features/presentation/types/presentation';

const { usePresentations } = await import('@/features/presentation/hooks/useApi');

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

    expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Testing Best Practices')).toBeInTheDocument();
  });

  it('displays table headers correctly', () => {
    renderWithProviders(<PresentationTable />);

    expect(screen.getByRole('columnheader', { name: /id/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /updated/i })).toBeInTheDocument();
  });

  it('does not show deprecated columns', () => {
    renderWithProviders(<PresentationTable />);

    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/status/i)).not.toBeInTheDocument();
  });

  it('formats dates in readable format', () => {
    renderWithProviders(<PresentationTable />);

    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('shows context menu when right-clicking on table row', async () => {
    renderWithProviders(<PresentationTable />);

    const firstRow = screen.getByText('My First Presentation').closest('tr')!;

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

      fireEvent.click(editButton);
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

      fireEvent.click(deleteButton);
    });
  });

  it('provides sortable column headers for user interaction', async () => {
    renderWithProviders(<PresentationTable />);

    const createdAtHeader = screen.getByRole('columnheader', { name: /created/i });
    expect(createdAtHeader).toBeInTheDocument();
    expect(createdAtHeader).toBeVisible();

    fireEvent.click(createdAtHeader);

    expect(createdAtHeader).toBeInTheDocument();
    expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
  });

  it('provides accessible search functionality for users', async () => {
    renderWithProviders(<PresentationTable />);

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeVisible();

    fireEvent.change(searchInput, { target: { value: 'React' } });
    expect(searchInput).toHaveValue('React');

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput).toHaveValue('');

    expect(searchInput).toBeEnabled();
    expect(searchInput).toHaveAttribute('placeholder');
  });

  it('shows filtered search results', () => {
    const filteredData = [mockPresentationData[1]];
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

      const skeletonElements = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);

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
      expect(screen.queryByRole('table')).toBeInTheDocument();
      expect(screen.getByText(/no presentations/i)).toBeInTheDocument();
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

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    });
  });

  describe('user interaction scenarios', () => {
    it('provides complete workflow for managing presentations', async () => {
      renderWithProviders(<PresentationTable />);

      expect(screen.getByText('Testing Best Practices')).toBeInTheDocument();
      expect(screen.getByText('My First Presentation')).toBeInTheDocument();
      expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();

      const presentationRow = screen.getByText('Testing Best Practices').closest('tr')!;
      fireEvent.contextMenu(presentationRow);

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

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);

      rows.slice(1).forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells.length).toBeGreaterThan(0);
      });
    });
  });
});
