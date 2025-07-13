import { CardsDemo } from '@/shared/components/cards';
import { createBrowserRouter } from 'react-router-dom';
import NavLayout from '../shared/layouts/NavLayout';
import PresentationPage from '@/features/presentation';

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
        element: <PresentationPage />,
      },
    ],
  },
]);

export default router;
