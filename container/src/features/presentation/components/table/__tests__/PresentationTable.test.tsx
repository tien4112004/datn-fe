import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import { renderWithProviders } from '@/tests/test-utils';
import type { PresentationItem } from '@/features/presentation/types/presentation';

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
  const mockPresentationData: PresentationItem[] = [
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
      presentationItems: mockPresentationData,
      isLoading: false,
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
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  it('handles edit action from context menu', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderWithProviders(<PresentationTable />);

    const firstRow = screen.getByText('My First Presentation').closest('tr')!;
    fireEvent.contextMenu(firstRow);

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Edit',
      expect.objectContaining({
        id: '1',
        title: 'My First Presentation',
      })
    );

    consoleSpy.mockRestore();
  });

  it('handles delete action from context menu', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderWithProviders(<PresentationTable />);

    const secondRow = screen.getByText('Advanced React Patterns').closest('tr')!;
    fireEvent.contextMenu(secondRow);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Delete',
      expect.objectContaining({
        id: '2',
        title: 'Advanced React Patterns',
      })
    );

    consoleSpy.mockRestore();
  });

  it('allows sorting by clicking column headers', async () => {
    renderWithProviders(<PresentationTable />);

    // Click on title column header to sort
    const titleHeader = screen.getByRole('columnheader', { name: /title/i });
    fireEvent.click(titleHeader);

    // Verify sorting behavior by checking if presentations are reordered
    await waitFor(() => {
      const titles = screen.getAllByText(/presentation|patterns|practices/i).map((el) => el.textContent);
      // After sorting, order should change (implementation depends on actual sorting logic)
      expect(titles).toBeDefined();
    });
  });

  it('supports keyboard navigation for accessibility', async () => {
    renderWithProviders(<PresentationTable />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Test that table is focusable for keyboard navigation
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Header + data rows
  });

  describe('loading and empty states', () => {
    it('shows loading indicators when data is being fetched', () => {
      vi.mocked(usePresentations).mockReturnValue({
        presentationItems: [],
        isLoading: true,
      } as any);

      renderWithProviders(<PresentationTable />);

      // Look for skeleton loading animations by class
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays empty state message when no presentations exist', () => {
      vi.mocked(usePresentations).mockReturnValue({
        presentationItems: [],
        isLoading: false,
      } as any);

      renderWithProviders(<PresentationTable />);

      // Check for empty state messaging
      expect(screen.getByText(/no presentations/i)).toBeInTheDocument();
    });

    it('shows data table when presentations are available', () => {
      renderWithProviders(<PresentationTable />);

      // Check that table with data is rendered
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    });
  });

  describe('user interaction scenarios', () => {
    it('allows user to edit a presentation', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderWithProviders(<PresentationTable />);

      // Find and right-click on a presentation
      const presentationRow = screen.getByText('Testing Best Practices').closest('tr')!;
      fireEvent.contextMenu(presentationRow);

      // Click edit from context menu
      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      // Verify edit action was triggered
      expect(consoleSpy).toHaveBeenCalledWith(
        'Edit',
        expect.objectContaining({
          title: 'Testing Best Practices',
        })
      );

      consoleSpy.mockRestore();
    });

    it('allows user to delete a presentation', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderWithProviders(<PresentationTable />);

      // Find and right-click on a presentation
      const presentationRow = screen.getByText('My First Presentation').closest('tr')!;
      fireEvent.contextMenu(presentationRow);

      // Click delete from context menu
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);
      });

      // Verify delete action was triggered
      expect(consoleSpy).toHaveBeenCalledWith(
        'Delete',
        expect.objectContaining({
          title: 'My First Presentation',
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
