import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App.tsx';
import { CardsDemo } from '@/shared/components/cards';
import PresentationPage from '@/features/presentation/page';

const toolbarConfig = {
  plugins: [ReactPlugin],
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <StagewiseToolbar config={toolbarConfig} />
  </StrictMode>
);
