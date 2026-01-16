import { render, type RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/context/auth';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/shared/i18n';
import { vi } from 'vitest';
import { SidebarProvider } from '@/components/ui/sidebar';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  routeHistory?: string[];
  routes?: RouteObject[];
  queryClient?: QueryClient;
  excludeProviders?: string[];
  includeProviders?: string[];
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Custom test utility for rendering React components with all necessary app providers.
 *
 * @function renderWithProviders
 * @param {React.ReactElement} ui - The React component to render.
 * @param {Object} options - Extended render options.
 * @param {string} [options.route='/'] - Initial route for MemoryRouter.
 * @param {string[]} [options.routeHistory=['/']] - Array of routes for navigation history.
 * @param {RouteObject[]} [options.routes] - Custom route objects for RouterProvider (for routing tests).
 * @param {QueryClient} [options.queryClient] - Custom QueryClient instance for React Query.
 * @param {string[]} [options.excludeProviders] - Array of provider names to exclude (e.g., ['i18n', 'react-query', 'api']).
 * @param {string[]} [options.includeProviders] - Array of provider names to include (e.g., ['auth']). Only these providers will be included.
 * @param {...RenderOptions} [options.renderOptions] - Other @testing-library/react render options.
 * @returns {ReturnType<typeof render>} The result of RTL's render() with all providers applied.
 *
 * @example
 * // Basic usage
 * renderWithProviders(<MyComponent />);
 *
 * @example
 * // With custom route
 * renderWithProviders(<MyComponent />, { route: '/dashboard' });
 *
 * @example
 * // With custom routes
 * renderWithProviders(<MyComponent />, {
 *   routes: [{ path: '/', element: <MyComponent /> }],
 *   routeHistory: ['/']
 * });
 *
 * @example
 * // Exclude i18n and react-query providers
 * renderWithProviders(<MyComponent />, { excludeProviders: ['i18n', 'react-query'] });
 *
 * @example
 * // Include auth provider only
 * renderWithProviders(<MyComponent />, { includeProviders: ['auth'] });
 */
const renderWithProviders = (
  ui: React.ReactElement,
  {
    route = '/',
    routeHistory = ['/'],
    routes,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    excludeProviders = [],
    includeProviders = [],
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    let node = children;

    // Router
    if (routes) {
      const testRoutes = routes.map((route, idx) => (idx === 0 ? { ...route, element: ui } : route));
      const router = createMemoryRouter(testRoutes, {
        initialEntries: routeHistory,
        initialIndex: routeHistory.length - 1,
      });
      node = <RouterProvider router={router} />;
    } else {
      node = <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
    }

    // AuthProvider (opt-in via includeProviders)
    if (includeProviders.includes('auth')) {
      node = <AuthProvider>{node}</AuthProvider>;
    }

    // QueryClientProvider
    if (!excludeProviders.includes('react-query')) {
      node = <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>;
    }

    // I18n
    if (!excludeProviders.includes('i18n')) {
      node = <I18nextProvider i18n={i18n}>{node}</I18nextProvider>;
    }

    // Sidebar
    if (!excludeProviders.includes('sidebar')) {
      node = <SidebarProvider>{node}</SidebarProvider>;
    }

    return node;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export { renderWithProviders };
