import { RouterProvider } from 'react-router-dom';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';
import router from './router';
import '@/shared/i18n';
import { ApiSwitchingProvider } from '@/shared/context/api-switching';

const toolbarConfig = {
  plugins: [ReactPlugin],
};

export default function App() {
  return (
    <>
      <ApiSwitchingProvider>
        <RouterProvider router={router} />
      </ApiSwitchingProvider>
      <StagewiseToolbar config={toolbarConfig} />
    </>
  );
}
