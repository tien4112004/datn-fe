import { createBrowserRouter } from 'react-router-dom';
import NavLayout from '../shared/layouts/NavLayout';
import Presentation from '@/features/presentation';
import Demo from '@/features/demo';
import GlobalSpinner from '@/shared/components/common/GlobalSpinner';

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
