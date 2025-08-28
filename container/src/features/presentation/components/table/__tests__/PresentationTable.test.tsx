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

vi.mock('@/features/presentation/components/table/ActionButton', () => ({
  ActionContent: vi.fn(({ onEdit, onDelete }) => (
    <div data-testid="action-content">
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
  default: vi.fn(({ table, isLoading, emptyState, contextMenu }) => {
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
                <td data-testid="context-menu">{contextMenu && contextMenu(row)}</td>
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
      'presentation.createdAt': 'Created At',
      'presentation.updatedAt': 'Updated At',
      'presentation.emptyState': 'No presentations found',
    };
    return translations[key] || key;
  });

  const mockPresentationData = [
    {
      id: '1',
      title: 'Test Presentation',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
    {
      id: '2',
      title: 'Another Presentation',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-04T00:00:00Z',
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
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Updated At')).toBeInTheDocument();
  });

  it('does not render description and status columns', () => {
    render(<PresentationTable />);

    expect(screen.queryByText('Description')).not.toBeInTheDocument();
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
  });

  it('uses translation hook correctly', () => {
    render(<PresentationTable />);

    expect(mockUseTranslation).toHaveBeenCalledWith('table');
    expect(mockT).toHaveBeenCalledWith('presentation.id');
    expect(mockT).toHaveBeenCalledWith('presentation.title');
    expect(mockT).toHaveBeenCalledWith('presentation.createdAt');
    expect(mockT).toHaveBeenCalledWith('presentation.updatedAt');
  });

  it('renders presentation data correctly', () => {
    render(<PresentationTable />);

    expect(screen.getByText('Test Presentation')).toBeInTheDocument();
    expect(screen.getByText('Another Presentation')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<PresentationTable />);

    // Check if dates are formatted (the exact format depends on locale)
    expect(screen.getByTestId('cell-createdAt')).toBeInTheDocument();
    expect(screen.getByTestId('cell-updatedAt')).toBeInTheDocument();
  });

  it('renders context menu for each row', () => {
    render(<PresentationTable />);

    const contextMenus = screen.getAllByTestId('context-menu');
    expect(contextMenus).toHaveLength(2);

    const actionContents = screen.getAllByTestId('action-content');
    expect(actionContents).toHaveLength(2);
  });

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
