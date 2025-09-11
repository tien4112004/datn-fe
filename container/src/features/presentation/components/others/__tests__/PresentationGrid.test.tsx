import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PresentationGrid from '../PresentationGrid';
import { renderWithProviders } from '@/tests/test-utils';
import type { Presentation } from '@/features/presentation/types/presentation';

// Mock ThumbnailWrapper
vi.mock('../ThumbnailWrapper', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-thumbnail-wrapper" />,
}));

const { usePresentations } = await import('@/features/presentation/hooks/useApi');

vi.mock('@/features/presentation/api/service', () => ({
  presentationService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/features/presentation/hooks/useApi', () => ({
  usePresentations: vi.fn(),
}));

describe('PresentationGrid', () => {
  const mockPresentationData: Presentation[] = [
    {
      id: '1',
      title: 'My First Presentation',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-02T15:30:00Z',
      slides: [{ id: 'slide1' } as any],
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      createdAt: '2023-01-03T09:15:00Z',
      updatedAt: '2023-01-04T14:45:00Z',
      slides: [{ id: 'slide2' } as any],
    },
    {
      id: '3',
      title: 'Testing Best Practices',
      createdAt: '2023-01-05T11:20:00Z',
      updatedAt: '2023-01-05T16:10:00Z',
      slides: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePresentations).mockReturnValue({
      data: mockPresentationData,
      isLoading: false,
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 3,
      search: '',
      setSearch: vi.fn(),
    } as any);
  });

  it('displays presentations with correct data', () => {
    renderWithProviders(<PresentationGrid />);
    expect(screen.getByText('My First Presentation')).toBeInTheDocument();
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Testing Best Practices')).toBeInTheDocument();
  });

  it('renders ThumbnailWrapper for presentations with slides', () => {
    renderWithProviders(<PresentationGrid />);
    expect(screen.getAllByTestId('mock-thumbnail-wrapper').length).toBe(2);
  });

  it('shows "No thumbnail" for presentations without slides', () => {
    renderWithProviders(<PresentationGrid />);
    expect(screen.getByText('No thumbnail')).toBeInTheDocument();
  });

  it('shows search bar and allows typing', () => {
    renderWithProviders(<PresentationGrid />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'React' } });
    expect(searchInput).toHaveValue('React');
  });

  it('shows filtered search results', () => {
    const filteredData = [mockPresentationData[1]];
    vi.mocked(usePresentations).mockReturnValue({
      data: filteredData,
      isLoading: false,
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 1,
      search: 'React',
      setSearch: vi.fn(),
    } as any);
    renderWithProviders(<PresentationGrid />);
    expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
    expect(screen.queryByText('My First Presentation')).not.toBeInTheDocument();
    expect(screen.queryByText('Testing Best Practices')).not.toBeInTheDocument();
  });

  it('shows empty state when no presentations exist', () => {
    vi.mocked(usePresentations).mockReturnValue({
      data: [],
      isLoading: false,
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 0,
      search: '',
      setSearch: vi.fn(),
    } as any);
    renderWithProviders(<PresentationGrid />);
    expect(screen.getByText(/no/i)).toBeInTheDocument();
    expect(screen.getByText(/create/i)).toBeInTheDocument();
  });

  // it('navigates pages with next/previous buttons', () => {
  //   const setPagination = vi.fn();
  //   vi.mocked(usePresentations).mockReturnValue({
  //     data: mockPresentationData,
  //     isLoading: false,
  //     pagination: { pageIndex: 0, pageSize: 1 },
  //     setPagination,
  //     totalItems: 3,
  //     search: '',
  //     setSearch: vi.fn(),
  //   } as any);
  //   renderWithProviders(<PresentationGrid />);
  //   const nextBtn = screen.getByRole('button', { name: /next/i });
  //   fireEvent.click(nextBtn);
  //   expect(setPagination).toHaveBeenCalled();
  //   const prevBtn = screen.getByRole('button', { name: /previous/i });
  //   fireEvent.click(prevBtn);
  //   expect(setPagination).toHaveBeenCalled();
  // });
});
