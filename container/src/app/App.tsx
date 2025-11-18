import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import '@/shared/i18n';
import { ApiSwitchingProvider } from '@/shared/context/api-switching';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/shared/context/auth';
import { Toaster } from '@/shared/components/ui/sonner';

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ApiSwitchingProvider>
            <RouterProvider router={router} />
          </ApiSwitchingProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Toaster />
    </>
  );
}
