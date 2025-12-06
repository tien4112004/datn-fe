import { createBrowserRouter } from 'react-router-dom';
import NavLayout, { NavLayoutErrorBoundary } from '../shared/layouts/SidebarLayout';
import { CriticalError } from '@aiprimary/api';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/LoginPage')).LoginPage,
    }),
  },
  {
    path: '/register',
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/RegisterPage')).RegisterPage,
    }),
  },
  {
    path: '/auth/google/callback',
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/GoogleCallbackPage')).default,
    }),
  },
  {
    element: (
      <ProtectedRoute>
        <NavLayout />
      </ProtectedRoute>
    ),
    errorElement: <NavLayoutErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/demo')).default.CardDemoPage,
        }),
      },
      {
        path: 'projects',
        lazy: async () => ({
          Component: (await import('@/features/projects')).default.ProjectListPage,
        }),
      },
      {
        path: 'image',
        lazy: async () => ({
          Component: (await import('@/features/image')).default.ImageGalleryPage,
        }),
      },
      {
        path: 'image/generate',
        lazy: async () => ({
          Component: (await import('@/features/image')).default.CreateImagePage,
        }),
      },
      {
        path: 'image/:id',
        lazy: async () => ({
          Component: (await import('@/features/image')).default.ImageDetailPage,
        }),
      },
      {
        path: 'mindmap/generate',
        lazy: async () => ({
          Component: (await import('@/features/mindmap')).default.CreateMindmapPage,
        }),
      },
      {
        path: 'mindmap/:id',
        lazy: async () => ({
          Component: (await import('@/features/mindmap')).default.MindmapPage,
          loader: (await import('@/features/mindmap/hooks/loaders')).getMindmapById,
        }),
      },
      {
        path: 'presentation/:id',
        lazy: async () => ({
          Component: (await import('@/features/presentation')).default.DetailPage,
          loader: (await import('@/features/presentation/hooks/loaders')).getPresentationById,
        }),
      },
      {
        path: 'presentation/generate',
        lazy: async () => ({
          Component: (await import('@/features/presentation')).default.PresentationOutlinePage,
        }),
      },
      {
        path: 'classes',
        lazy: async () => ({
          Component: (await import('@/features/classes')).default.ClassListPage,
        }),
      },
      {
        path: 'classes/:id',
        lazy: async () => ({
          Component: (await import('@/features/classes')).default.ClassDetailPage,
          loader: (await import('@/features/classes/shared/hooks/loaders')).getClassById,
        }),
        shouldRevalidate: ({ currentUrl, nextUrl }) => {
          return currentUrl.pathname !== nextUrl.pathname;
        },
      },
      {
        path: 'periods/:id',
        lazy: async () => ({
          Component: (await import('@/features/classes')).default.PeriodDetailPage,
        }),
      },
      {
        path: 'lessons/:id',
        lazy: async () => ({
          Component: (await import('@/features/classes')).default.LessonDetailPage,
        }),
      },
      {
        path: 'lessons/create',
        lazy: async () => ({
          Component: (await import('@/features/classes')).default.LessonCreatorPage,
        }),
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('@/features/settings')).default.SettingsPage,
        }),
      },
      {
        path: 'profile',
        lazy: async () => ({
          Component: (await import('@/features/user/components/UserProfile')).default,
        }),
      },
      {
        path: 'error',
        Component: () => {
          throw new CriticalError('This is a critical error page.');
        },
      },
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('@/shared/pages/NotFoundPage')).default,
        }),
      },
    ],
  },
]);

export default router;
