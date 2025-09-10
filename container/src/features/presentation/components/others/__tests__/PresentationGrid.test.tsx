import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import PresentationGrid from '../PresentationGrid';
import type { Presentation } from '@/features/presentation/types/presentation';
import React from 'react';

vi.mock('@/features/presentation/hooks/useApi', () => ({
  usePresentations: vi.fn(),
}));

import { usePresentations } from '@/features/presentation/hooks/useApi';

const createMockVueRemoteWrapper = (overrides: any = {}) => {
  const mockMount = vi.fn();
  const mockModuleImports = {
    editor: vi.fn().mockResolvedValue({ mount: mockMount }),
    thumbnail: vi.fn().mockResolvedValue({ mount: mockMount }),
    ...overrides.moduleImports,
  };

  return {
    component: React.forwardRef<any, any>(
      ({
        modulePath,
        mountProps,
        className = '',
        LoadingComponent,
        ErrorComponent,
        onMountSuccess,
        onMountError,
      }) => {
        const containerRef = React.useRef(null);
        const hasMounted = React.useRef(false);
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<Error | null>(null);

        React.useEffect(() => {
          if (hasMounted.current) return;
          hasMounted.current = true;

          setIsLoading(true);
          setError(null);

          if (!mockModuleImports[modulePath]) {
            const err = new Error(`Unknown module path: ${modulePath}`);
            setIsLoading(false);
            setError(err);
            onMountError?.(err);
            return;
          }

          mockModuleImports[modulePath]()
            .then((mod: any) => {
              mod.mount(containerRef.current, mountProps);
              setIsLoading(false);
              onMountSuccess?.();
            })
            .catch((err: Error) => {
              console.error(`Failed to load Vue remote (${modulePath}):`, err);
              setIsLoading(false);
              setError(err);
              onMountError?.(err);
            });
        }, []);

        return (
          <>
            <div ref={containerRef} className={className} data-testid="vue-container" />
            {isLoading && LoadingComponent && <LoadingComponent />}
            {error && ErrorComponent && <ErrorComponent error={error} />}
          </>
        );
      }
    ),
    mockMount,
    mockModuleImports,
  };
};

vi.mock('@/features/presentation/components/remote/VueRemoteWrapper', async () => {
  const actual = await vi.importActual<any>('@/features/presentation/components/remote/VueRemoteWrapper');
  const mock = createMockVueRemoteWrapper();
  return {
    ...actual,
    default: mock.component,
    __esModule: true,
  };
});

describe('PresentationGrid', () => {
  const mockPresentations: Presentation[] = [
    {
      id: '1',
      title: 'Tondeptrai',
      createdAt: '2024-10-10T10:10:10.000Z',
      updatedAt: '2024-10-10T10:10:10.000Z',
      width: 1000,
      height: 562.5,
      theme: {
        themeColors: ['rgba(71,172,197,1)'],
        fontColor: '#333',
        fontName: '',
        backgroundColor: '#fff',
        shadow: { h: 3, v: 3, blur: 2, color: '#808080' },
        outline: { width: 2, color: '#525252', style: 'solid' },
      },
      slides: [
        {
          id: 'AW4E1Cxoho',
          elements: [],
          background: { type: 'solid', color: '#fff' },
          type: 'cover',
        },
      ],
    },
    {
      id: '2',
      title: 'Second Presentation',
      createdAt: '2023-01-03T09:15:00Z',
      updatedAt: '2023-01-04T14:45:00Z',
      width: 1000,
      height: 562.5,
      theme: {
        themeColors: ['rgba(71,172,197,1)'],
        fontColor: '#333',
        fontName: '',
        backgroundColor: '#fff',
        shadow: { h: 3, v: 3, blur: 2, color: '#808080' },
        outline: { width: 2, color: '#525252', style: 'solid' },
      },
      slides: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePresentations).mockReturnValue({
      data: mockPresentations,
      isLoading: false,
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 2,
      search: '',
      setSearch: vi.fn(),
    } as any);
  });

  it('renders presentation cards with correct titles', () => {
    renderWithProviders(<PresentationGrid />);
    expect(screen.getByText('First Presentation')).toBeInTheDocument();
    expect(screen.getByText('Second Presentation')).toBeInTheDocument();
  });

  it('shows empty state when no presentations', () => {
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
    expect(screen.getByText(/empty state/i)).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    vi.mocked(usePresentations).mockReturnValue({
      data: [],
      isLoading: true,
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 0,
      search: '',
      setSearch: vi.fn(),
    } as any);
    renderWithProviders(<PresentationGrid />);
    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
  });

  it('filters presentations by search', async () => {
    const setSearch = vi.fn();
    vi.mocked(usePresentations).mockReturnValue({
      data: mockPresentations,
      isLoading: false,
      pagination: { pageIndex: 0, pageSize: 10 },
      setPagination: vi.fn(),
      totalItems: 2,
      search: '',
      setSearch,
    } as any);
    renderWithProviders(<PresentationGrid />);
    const searchInput = screen.getByPlaceholderText(/search presentations/i);
    await userEvent.type(searchInput, 'First');
    expect(setSearch).toHaveBeenCalledWith('First');
  });

  it('handles pagination controls', async () => {
    const setPagination = vi.fn();
    vi.mocked(usePresentations).mockReturnValue({
      data: mockPresentations,
      isLoading: false,
      pagination: { pageIndex: 0, pageSize: 1 },
      setPagination,
      totalItems: 2,
      search: '',
      setSearch: vi.fn(),
    } as any);
    renderWithProviders(<PresentationGrid />);
    const nextBtn = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextBtn);
    expect(setPagination).toHaveBeenCalled();
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    await userEvent.click(prevBtn);
    expect(setPagination).toHaveBeenCalled();
  });
});
