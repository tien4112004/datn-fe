import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import NavLayout, { NavLayoutErrorBoundary } from '../shared/layouts/SidebarLayout';
import { CriticalError } from '@aiprimary/api';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import GlobalSpinner from '@/components/common/GlobalSpinner';

// Lazy load auth pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const GoogleCallbackPage = lazy(() => import('@/features/auth/pages/GoogleCallbackPage'));

// Lazy load feature pages
const CardDemoPage = lazy(() => import('@/features/demo').then((m) => ({ default: m.default.CardDemoPage })));
const ThumbnailDemoPage = lazy(() =>
  import('@/features/presentation').then((m) => ({ default: m.default.ThumbnailDemoPage }))
);
const ProjectListPage = lazy(() =>
  import('@/features/projects').then((m) => ({ default: m.default.ProjectListPage }))
);
const PresentationListPage = lazy(() =>
  import('@/features/presentation').then((m) => ({ default: m.default.PresentationListPage }))
);
const ImageGalleryPage = lazy(() =>
  import('@/features/image').then((m) => ({ default: m.default.ImageGalleryPage }))
);
const CreateImagePage = lazy(() =>
  import('@/features/image').then((m) => ({ default: m.default.CreateImagePage }))
);
const ImageDetailPage = lazy(() =>
  import('@/features/image').then((m) => ({ default: m.default.ImageDetailPage }))
);
const CreateMindmapPage = lazy(() =>
  import('@/features/mindmap').then((m) => ({ default: m.default.CreateMindmapPage }))
);
const MindmapPage = lazy(() =>
  import('@/features/mindmap').then((m) => ({ default: m.default.MindmapPage }))
);
const PresentationDetailPage = lazy(() =>
  import('@/features/presentation').then((m) => ({ default: m.default.DetailPage }))
);
const PresentationOutlinePage = lazy(() =>
  import('@/features/presentation').then((m) => ({ default: m.default.PresentationOutlinePage }))
);
const ClassListPage = lazy(() =>
  import('@/features/classes').then((m) => ({ default: m.default.ClassListPage }))
);
const ClassDetailPage = lazy(() =>
  import('@/features/classes').then((m) => ({ default: m.default.ClassDetailPage }))
);
const PeriodDetailPage = lazy(() =>
  import('@/features/classes').then((m) => ({ default: m.default.PeriodDetailPage }))
);
const LessonDetailPage = lazy(() =>
  import('@/features/classes').then((m) => ({ default: m.default.LessonDetailPage }))
);
const LessonCreatorPage = lazy(() =>
  import('@/features/classes').then((m) => ({ default: m.default.LessonCreatorPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.default.SettingsPage }))
);
const UserProfilePage = lazy(() => import('@/features/user/components/UserProfile'));
const NotFoundPage = lazy(() => import('@/shared/pages/NotFoundPage'));

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<GlobalSpinner text="Loading..." />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyWrapper>
        <LoginPage />
      </LazyWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <LazyWrapper>
        <RegisterPage />
      </LazyWrapper>
    ),
  },
  {
    path: '/auth/google/callback',
    element: (
      <LazyWrapper>
        <GoogleCallbackPage />
      </LazyWrapper>
    ),
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
        element: (
          <LazyWrapper>
            <CardDemoPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'presentation/thumbnail',
        element: (
          <LazyWrapper>
            <ThumbnailDemoPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'projects',
        element: (
          <LazyWrapper>
            <ProjectListPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'presentation',
        element: (
          <LazyWrapper>
            <PresentationListPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'image',
        element: (
          <LazyWrapper>
            <ImageGalleryPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'image/generate',
        element: (
          <LazyWrapper>
            <CreateImagePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'image/:id',
        element: (
          <LazyWrapper>
            <ImageDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'mindmap/generate',
        element: (
          <LazyWrapper>
            <CreateMindmapPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'mindmap/:id',
        element: (
          <LazyWrapper>
            <MindmapPage />
          </LazyWrapper>
        ),
        async lazy() {
          const loader = await import('@/features/mindmap/hooks/loaders');
          return { loader: loader.getMindmapById };
        },
      },
      {
        path: 'presentation/:id',
        element: (
          <LazyWrapper>
            <PresentationDetailPage />
          </LazyWrapper>
        ),
        async lazy() {
          const loader = await import('@/features/presentation/hooks/loaders');
          return { loader: loader.getPresentationById };
        },
      },
      {
        path: 'presentation/generate',
        element: (
          <LazyWrapper>
            <PresentationOutlinePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'classes',
        element: (
          <LazyWrapper>
            <ClassListPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'classes/:id',
        element: (
          <LazyWrapper>
            <ClassDetailPage />
          </LazyWrapper>
        ),
        async lazy() {
          const loader = await import('@/features/classes/shared/hooks/loaders');
          return { loader: loader.getClassById };
        },
        shouldRevalidate: ({ currentUrl, nextUrl }) => {
          return currentUrl.pathname !== nextUrl.pathname;
        },
      },
      {
        path: 'periods/:id',
        element: (
          <LazyWrapper>
            <PeriodDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'lessons/:id',
        element: (
          <LazyWrapper>
            <LessonDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'lessons/create',
        element: (
          <LazyWrapper>
            <LessonCreatorPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyWrapper>
            <SettingsPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <LazyWrapper>
            <UserProfilePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'error',
        Component: () => {
          throw new CriticalError('This is a critical error page.');
        },
      },
      {
        path: '*',
        element: (
          <LazyWrapper>
            <NotFoundPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);

export default router;
