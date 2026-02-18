import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@ui/sonner';
import { AuthProvider } from '@/context/auth';
import { QuestionConfigProvider } from '@aiprimary/question';
import { ImageUploader } from '@/components/question/shared/ImageUploader';
import { router } from './router';
import './i18n';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <QuestionConfigProvider imageUploader={ImageUploader}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </QuestionConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
