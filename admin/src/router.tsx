import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import GlobalSpinner from '@/components/common/GlobalSpinner';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const UserDetailPage = lazy(() =>
  import('@/pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage }))
);
const SlideThemesPage = lazy(() =>
  import('@/pages/SlideThemesPage').then((m) => ({ default: m.SlideThemesPage }))
);
const ThemeFormPage = lazy(() => import('@/pages/ThemeFormPage').then((m) => ({ default: m.ThemeFormPage })));
const SlideTemplatesPage = lazy(() =>
  import('@/pages/SlideTemplatesPage').then((m) => ({ default: m.SlideTemplatesPage }))
);
const TemplateFormPage = lazy(() =>
  import('@/pages/TemplateFormPage').then((m) => ({ default: m.TemplateFormPage }))
);
const ArtStylesPage = lazy(() => import('@/pages/ArtStylesPage').then((m) => ({ default: m.ArtStylesPage })));
const ModelConfigPage = lazy(() =>
  import('@/pages/ModelConfigPage').then((m) => ({ default: m.ModelConfigPage }))
);
const FAQPostsPage = lazy(() => import('@/pages/FAQPostsPage').then((m) => ({ default: m.FAQPostsPage })));
const BooksPage = lazy(() => import('@/pages/BooksPage').then((m) => ({ default: m.BooksPage })));
const QuestionBankPage = lazy(() =>
  import('@/pages/QuestionBankPage').then((m) => ({ default: m.QuestionBankPage }))
);

const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<GlobalSpinner text="Loading..." />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyWrapper>
        <LoginPage />
      </LazyWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <LazyWrapper>
            <DashboardPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <LazyWrapper>
            <UsersPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <LazyWrapper>
            <UserDetailPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'slide-themes',
        element: (
          <LazyWrapper>
            <SlideThemesPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'slide-themes/new',
        element: (
          <LazyWrapper>
            <ThemeFormPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'slide-themes/:id',
        element: (
          <LazyWrapper>
            <ThemeFormPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'slide-templates',
        element: (
          <LazyWrapper>
            <SlideTemplatesPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'slide-templates/new',
        element: (
          <LazyWrapper>
            <TemplateFormPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'slide-templates/:id',
        element: (
          <LazyWrapper>
            <TemplateFormPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'art-styles',
        element: (
          <LazyWrapper>
            <ArtStylesPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'model-config',
        element: (
          <LazyWrapper>
            <ModelConfigPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'faq-posts',
        element: (
          <LazyWrapper>
            <FAQPostsPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'books',
        element: (
          <LazyWrapper>
            <BooksPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'question-bank',
        element: (
          <LazyWrapper>
            <QuestionBankPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);
