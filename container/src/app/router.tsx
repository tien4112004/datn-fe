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
import Image from '@/features/image';

const router = createBrowserRouter([
  {
    element: <NavLayout />,
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
        path: 'settings',
        Component: Settings.SettingsPage,
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
