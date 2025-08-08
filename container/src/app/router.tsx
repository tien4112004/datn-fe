import { createBrowserRouter } from 'react-router-dom';
import NavLayout from '../shared/layouts/SidebarLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';
import { getDefaultModel } from '@/features/model';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import { CriticalError } from '@/types/errors';

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
        path: 'presentation/outline',
        Component: Demo.TestOutlineGenerator2,
      },
      {
        path: 'presentation/editor',
        Component: Presentation.EditorPage,
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
