import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { UserDetailPage } from '@/pages/UserDetailPage';
import { SlideThemesPage } from '@/pages/SlideThemesPage';
import { SlideTemplatesPage } from '@/pages/SlideTemplatesPage';
import { ModelConfigPage } from '@/pages/ModelConfigPage';
import { FAQPostsPage } from '@/pages/FAQPostsPage';
import { BooksPage } from '@/pages/BooksPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/:id',
        element: <UserDetailPage />,
      },
      {
        path: 'slide-themes',
        element: <SlideThemesPage />,
      },
      {
        path: 'slide-templates',
        element: <SlideTemplatesPage />,
      },
      {
        path: 'model-config',
        element: <ModelConfigPage />,
      },
      {
        path: 'faq-posts',
        element: <FAQPostsPage />,
      },
      {
        path: 'books',
        element: <BooksPage />,
      },
    ],
  },
]);
