import { RouterProvider } from 'react-router-dom';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';
import router from './router';
import '@/shared/i18n';

const toolbarConfig = {
  plugins: [ReactPlugin],
};

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <StagewiseToolbar config={toolbarConfig} />
    </>
  );
}
