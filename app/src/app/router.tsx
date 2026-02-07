import { createBrowserRouter } from 'react-router-dom';
import NavLayout, { NavLayoutErrorBoundary } from '../shared/layouts/SidebarLayout';
import StudentLayout from '../shared/layouts/StudentLayout';
import { CriticalError } from '@aiprimary/api';
import { TeacherRoute } from '@/shared/components/TeacherRoute';
import { StudentRoute } from '@/shared/components/StudentRoute';
import { FeedTab } from '@/features/classes/class-feed';

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
    path: '/mindmap/embed/:id',
    lazy: async () => ({
      Component: (await import('@/features/mindmap')).default.MindmapEmbedPage,
      loader: (await import('@/features/mindmap/hooks/loaders')).getMindmapById,
    }),
  },
  {
    path: '/presentation/embed/:id',
    lazy: async () => ({
      Component: (await import('@/features/presentation')).default.PresentationEmbedPage,
    }),
  },
  {
    element: (
      <TeacherRoute>
        <NavLayout />
      </TeacherRoute>
    ),
    errorElement: <NavLayoutErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/features/dashboard')).default.DashboardPage,
        }),
      },
      {
        path: 'projects',
        lazy: async () => ({
          Component: (await import('@/features/projects')).default.ProjectListPage,
        }),
      },
      {
        path: 'image/generate',
        lazy: async () => ({
          Component: (await import('@/features/image')).default.CreateImagePage,
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
        path: 'classes/:id/feed',
        Component: () => <FeedTab classId="class1" />,
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('@/features/settings')).default.SettingsPage,
        }),
      },
      {
        path: 'notifications',
        lazy: async () => ({
          Component: (await import('@/features/notifications')).NotificationsPage,
        }),
      },
      {
        path: 'profile',
        lazy: async () => ({
          Component: (await import('@/features/user/components/UserProfile')).default,
        }),
      },
      {
        path: 'question-bank',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/TeacherQuestionBankPage'))
            .TeacherQuestionBankPage,
        }),
      },
      {
        path: 'question-bank/create',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/QuestionBankEditorPage'))
            .QuestionBankEditorPage,
        }),
        // Provide a simple loader so the page can consistently use useLoaderData()
        loader: async () => ({ question: null }),
      },
      {
        path: 'question-bank/edit/:id',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/QuestionBankEditorPage'))
            .QuestionBankEditorPage,
        }),
        loader: (await import('@/features/assignment/hooks/loaders')).getQuestionById,
      },
      {
        path: 'assignment/create',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/AssignmentEditorPage')).AssignmentEditorPage,
        }),
      },
      {
        path: 'assignment/edit/:id',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/AssignmentEditorPage')).AssignmentEditorPage,
        }),
      },
      {
        path: 'assignment/:id',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/AssignmentViewPage')).AssignmentViewPage,
        }),
      },
      {
        path: 'demo/question-renderer',
        lazy: async () => ({
          Component: (await import('@/features/assignment/pages/QuestionRendererDemoPage'))
            .QuestionRendererDemoPage,
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
  {
    element: (
      <StudentRoute>
        <StudentLayout />
      </StudentRoute>
    ),
    children: [
      {
        path: 'student/classes/:id',
        lazy: async () => ({
          Component: (await import('@/features/student/pages/StudentClassDetailPage')).StudentClassDetailPage,
          loader: (await import('@/features/classes/shared/hooks/loaders')).getClassById,
        }),
      },
      {
        path: 'student/presentation/:id',
        lazy: async () => ({
          Component: (await import('@/features/presentation')).default.StudentPresentationPage,
          loader: (await import('@/features/presentation/hooks/loaders')).getPresentationById,
        }),
      },
      {
        path: 'student/mindmap/:id',
        lazy: async () => ({
          Component: (await import('@/features/mindmap')).default.StudentMindmapPage,
          loader: (await import('@/features/mindmap/hooks/loaders')).getMindmapById,
        }),
      },
      {
        path: 'student',
        lazy: async () => ({
          Component: (await import('@/features/student/pages/StudentLandingPage')).StudentLandingPage,
        }),
      },
    ],
  },
]);

export default router;
