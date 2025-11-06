import { createBrowserRouter } from 'react-router-dom';
import NavLayout, { NavLayoutErrorBoundary } from '../shared/layouts/SidebarLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import { CriticalError } from '@/types/errors';
import Mindmap from '@/features/mindmap';
import { getPresentationById } from '@/features/presentation/hooks/loaders';
import { getMindmapById } from '@/features/mindmap/hooks/loaders';
import Projects from '@/features/projects';
import Settings from '@/features/settings';
import UserProfilePage from '@/features/user-profile/pages/UserProfilePage';
import Image from '@/features/image';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import GoogleCallbackPage from '@/features/auth/pages/GoogleCallbackPage';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import Classes from '@/features/classes';
import { getClassById } from '@/features/classes/shared/hooks/loaders';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallbackPage />,
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
        Component: Demo.CardDemoPage,
      },
      {
        path: 'presentation/thumbnail',
        Component: Presentation.ThumbnailDemoPage,
      },
      {
        path: 'projects',
        Component: Projects.ProjectListPage,
      },
      {
        path: 'presentation',
        Component: Presentation.PresentationListPage,
      },
      {
        path: 'image',
        Component: Image.ImageGalleryPage,
      },
      {
        path: 'image/generate',
        Component: Image.CreateImagePage,
      },
      {
        path: 'image/:id',
        Component: Image.ImageDetailPage,
      },
      {
        path: 'mindmap/generate',
        Component: Mindmap.CreateMindmapPage,
      },
      {
        path: 'mindmap/:id',
        Component: Mindmap.MindmapPage,
        loader: getMindmapById,
      },
      {
        path: 'presentation',
        element: <Presentation.Layout />,
        children: [
          {
            path: ':id',
            Component: Presentation.DetailPage,
            loader: getPresentationById,
          },
          {
            path: 'generate',
            Component: Presentation.PresentationOutlinePage,
          },
        ],
      },
      {
        path: 'classes',
        Component: Classes.ClassListPage,
      },
      {
        path: 'classes/:id',
        Component: Classes.ClassDetailPage,
        loader: getClassById,
        shouldRevalidate: ({ currentUrl, nextUrl }) => {
          // Only revalidate if the path params (id) changed, not search params (tab)
          return currentUrl.pathname !== nextUrl.pathname;
        },
      },
      {
        path: 'periods/:id',
        Component: Classes.PeriodDetailPage,
      },
      {
        path: 'lessons/:id',
        Component: Classes.LessonDetailPage,
      },
      {
        path: 'lessons/create',
        Component: Classes.LessonCreatorPage,
      },
      {
        path: 'settings',
        Component: Settings.SettingsPage,
      },
      {
        path: 'profile',
        Component: UserProfilePage,
      },
      {
        path: 'error',
        Component: () => {
          throw new CriticalError('This is a critical error page.');
        },
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]);

export default router;
