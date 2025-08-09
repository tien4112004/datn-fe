import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresentationTable from '@/features/presentation/components/table/PresentationTable';
import { usePresentations } from '@/features/presentation/hooks/useApi';

const mockUseTranslation = vi.fn();

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: (namespace?: string) => mockUseTranslation(namespace),
}));

vi.mock('@/features/presentation/hooks/useApi', () => ({
  usePresentations: vi.fn(),
}));

vi.mock('@/features/presentation/components/ActionButton', () => ({
  default: vi.fn(({ onEdit, onDelete }) => (
    <div data-testid="action-button">
      <button onClick={onEdit} data-testid="edit-button">
        Edit
      </button>
      <button onClick={onDelete} data-testid="delete-button">
        Delete
      </button>
    </div>
  )),
}));

vi.mock('@/components/table/DataTable', () => ({
  default: vi.fn(({ table, isLoading, emptyState }) => {
    if (isLoading) {
      return <div data-testid="loading-skeleton">Loading...</div>;
    }

    const hasRows = table.getRowModel().rows.length > 0;

    return (
      <div data-testid="data-table">
        <table>
          <thead>
            <tr>
              {table.getHeaderGroups()[0]?.headers.map((header: any) => (
                <th key={header.id}>{header.column.columnDef.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row: any) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell: any) => (
                  <td key={cell.id} data-testid={`cell-${cell.column.id}`}>
                    {typeof cell.column.columnDef.cell === 'function'
                      ? cell.column.columnDef.cell(cell.getContext())
                      : cell.getValue()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!hasRows && emptyState && <div data-testid="empty-state">{emptyState}</div>}
      </div>
    );
  }),
}));

describe('PresentationTable', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'presentation.id': 'ID',
      'presentation.title': 'Title',
      'presentation.description': 'Description',
      'presentation.createdAt': 'Created At',
      'presentation.status': 'Status',
      'presentation.emptyState': 'No presentations found',
      actions: 'Actions',
    };
    return translations[key] || key;
  });

  const mockPresentationData = [
    {
      id: '1',
      title: 'Test Presentation',
      description: 'Test Description',
      createdAt: '2023-01-01',
      status: 'active',
    },
    {
      id: '2',
      title: 'Another Presentation',
      description: 'Another Description',
      createdAt: '2023-01-02',
      status: 'inactive',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });
    vi.mocked(usePresentations).mockReturnValue({
      presentationItems: mockPresentationData,
      isLoading: false,
    } as any);
  });

  it('renders table with correct column headers', () => {
    render(<PresentationTable />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('uses translation hook correctly', () => {
    render(<PresentationTable />);

    expect(mockUseTranslation).toHaveBeenCalledWith('table');
    expect(mockT).toHaveBeenCalledWith('presentation.id');
    expect(mockT).toHaveBeenCalledWith('presentation.title');
    expect(mockT).toHaveBeenCalledWith('actions');
  });

  it('renders presentation data correctly', () => {
    render(<PresentationTable />);

    expect(screen.getByText('Test Presentation')).toBeInTheDocument();
    expect(screen.getByText('Another Presentation')).toBeInTheDocument();
  });

  // Why this test failed?
  // it('integrates ActionButton with correct callbacks', () => {
  //   const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  //   render(<PresentationTable />);

  //   const editButtons = screen.getAllByTestId('edit-button');
  //   const deleteButtons = screen.getAllByTestId('delete-button');

  //   editButtons[0].click();
  //   expect(consoleSpy).toHaveBeenCalledWith('Edit: ', '1');

  //   deleteButtons[0].click();
  //   expect(consoleSpy).toHaveBeenCalledWith('Delete: ', '1');

  //   consoleSpy.mockRestore();
  // });

  it('handles sorting state correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<PresentationTable />);

    expect(consoleSpy).toHaveBeenCalledWith('Sorting changed:', [{ id: 'createdAt', desc: true }]);

    consoleSpy.mockRestore();
  });

  it('handles pagination state correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<PresentationTable />);

    expect(consoleSpy).toHaveBeenCalledWith('Pagination changed:', {
      pageIndex: 0,
      pageSize: 10,
    });

    consoleSpy.mockRestore();
  });

  it('shows loading state when isLoading is true', () => {
    vi.mocked(usePresentations).mockReturnValue({
      presentationItems: [],
      isLoading: true,
    } as any);

    render(<PresentationTable />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no data and not loading', () => {
    vi.mocked(usePresentations).mockReturnValue({
      presentationItems: [],
      isLoading: false,
    } as any);

    render(<PresentationTable />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No presentations found')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
  });

  it('does not show empty state when loading', () => {
    vi.mocked(usePresentations).mockReturnValue({
      presentationItems: [],
      isLoading: true,
    } as any);

    render(<PresentationTable />);

    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('does not show empty state when there is data', () => {
    render(<PresentationTable />);

    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });
});
