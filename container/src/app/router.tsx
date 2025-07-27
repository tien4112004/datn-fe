import { createBrowserRouter } from 'react-router-dom';
import NavLayout from '../shared/layouts/SidebarLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';

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
        Component: Presentation.EditorPage,
      },
      {
        path: 'test',
        Component: Presentation.OutlineWorkspacePage,
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
    ],
  },
]);

export default router;
