import { CardsDemo } from '@/shared/components/cards';
import { createBrowserRouter } from 'react-router-dom';
import NavLayout from '../shared/layouts/NavLayout';
import Presentation from '@/features/presentation';

const router = createBrowserRouter([
  {
    path: '/',
    element: <NavLayout />,
    children: [
      {
        index: true,
        element: <CardsDemo />,
      },
      {
        path: 'presentation',
        element: <Presentation.EditorPage />,
      },
      {
        path: 'presentation/:presentationId',
        element: <Presentation.DetailsPage />,
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
