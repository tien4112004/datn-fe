import { createBrowserRouter } from 'react-router-dom';
import NavLayout, { NavLayoutErrorBoundary } from '../shared/layouts/SidebarLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';
import { getModels } from '@/features/model';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import { CriticalError } from '@/types/errors';
import Mindmap from '@/features/mindmap';
import { getMindmapById } from '@/features/mindmap/hooks/loaders';
import { getPresentationById } from '@/features/presentation/hooks/loaders';

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
        path: 'presentation',
        Component: Presentation.PresentationListPage,
      },
      {
        path: 'mindmap',
        Component: Mindmap.MindmapPage,
        loader: async () => {
          const mindmap = await getMindmapById('');
          return { mindmap };
        },
      },
      {
        path: 'presentation/:id',
        Component: Presentation.DetailPage,
        loader: async ({ params }) => {
          return await getPresentationById(params.id);
        },
      },
      {
        path: 'presentation/create',
        // Component: Presentation.CreateOutlinePage,
        Component: Presentation.PresentationOutlinePage,
        loader: getModels,
      },
      // {
      //   path: 'presentation/outline',
      //   Component: Presentation.OutlineWorkspacePage,
      // },
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
