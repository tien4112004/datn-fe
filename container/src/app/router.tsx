import { createBrowserRouter } from 'react-router-dom';
import NavLayout, { NavLayoutErrorBoundary } from '../shared/layouts/SidebarLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import { CriticalError } from '@/types/errors';
import Mindmap from '@/features/mindmap';
import { getMindmapById } from '@/features/mindmap/hooks/loaders';
import { getPresentationById } from '@/features/presentation/hooks/loaders';
import Projects from '@/features/projects';
import Settings from '@/features/settings';
import { getModels } from '@/features/model/hooks/loaders';

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
        path: 'mindmap',
        Component: Mindmap.MindmapPage,
        // TODO: checkout this loader
        loader: async () => {
          const mindmap = await getMindmapById('');
          return { mindmap };
        },
      },
      {
        path: 'presentation',
        element: <Presentation.Layout />,
        children: [
          {
            path: ':id',
            Component: Presentation.DetailPage2,
            // loader: getPresentationById,
          },
          {
            path: 'create',
            Component: Presentation.PresentationOutlinePage,
            loader: getModels,
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
