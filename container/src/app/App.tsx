import { RouterProvider } from 'react-router-dom';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import ReactPlugin from '@stagewise-plugins/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import '@/shared/i18n';
import { ApiSwitchingProvider } from '@/shared/context/api-switching';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const toolbarConfig = {
  plugins: [ReactPlugin],
};

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ApiSwitchingProvider>
          <RouterProvider router={router} />
        </ApiSwitchingProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <StagewiseToolbar config={toolbarConfig} />
    </>
  );
}
