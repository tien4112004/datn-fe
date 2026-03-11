import { Navigate, type RouteObject } from 'react-router-dom';
import DocsLayout from './DocsLayout';

export const docsRoutes: RouteObject[] = [
  {
    path: 'docs',
    Component: DocsLayout,
    children: [
      {
        index: true,
        element: <Navigate to="1" replace />,
      },
      {
        path: '1',
        lazy: async () => ({
          Component: (await import('./Doc1')).default,
        }),
      },
      {
        path: '2',
        lazy: async () => ({
          Component: (await import('./Doc2')).default,
        }),
      },
    ],
  },
];
