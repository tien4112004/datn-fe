import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import '@/shared/i18n';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/shared/context/auth';
import { Toaster } from '@ui/sonner';
import { NotificationInitializer } from '@/features/notifications';
import { QuestionConfigProvider } from '@aiprimary/question';
import { ImageUploader } from '@/features/question/components/shared/ImageUploader';

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <QuestionConfigProvider imageUploader={ImageUploader}>
            <NotificationInitializer />
            <RouterProvider router={router} />
          </QuestionConfigProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <Toaster />
    </>
  );
}
