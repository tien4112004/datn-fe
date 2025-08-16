import { createBrowserRouter } from 'react-router-dom';
import NavLayout from '../shared/layouts/SidebarLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';
import { getDefaultModel } from '@/features/model';
import Mindmap, { getMindmapById } from '@/features/mindmap';

const router = createBrowserRouter([
  {
    element: <NavLayout />,
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
        path: 'presentation/editor',
        Component: Presentation.EditorPage,
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
        path: 'presentation/:presentationId',
        Component: Presentation.DetailsPage,
        loader: async ({ params }) => {
          // Simulate api call
          await new Promise((resolve) => setTimeout(resolve, 2000));

          return { presentationId: params.presentationId };
        },
      },
      {
        path: 'presentation/create',
        // Component: Presentation.CreateOutlinePage,
        Component: Presentation.PresentationOutlinePage,
        loader: getDefaultModel,
      },
      // {
      //   path: 'presentation/outline',
      //   Component: Presentation.OutlineWorkspacePage,
      // },
    ],
  },
]);

export default router;
