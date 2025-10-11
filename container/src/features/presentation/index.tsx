import DetailPage from '@/features/presentation/pages/PresentationDetailPage';
import PresentationOutlinePage from '@/features/presentation/pages/PresentationOutlinePage';
import PresentationListPage from './pages/PresentationListPage';
import ThumbnailDemoPage from './pages/ThumbnailDemoPage';
import { Outlet } from 'react-router-dom';
import { PresentationGenerationProvider } from './contexts/PresentationGenerationContext';
import { moduleMethodMap } from './components/remote/module';
import { useEffect } from 'react';

const Layout = () => {
  useEffect(() => {
    moduleMethodMap['method']().then((mod) => {
      (mod.default as any).initializeFonts();
    });
  }, []);

  return (
    <PresentationGenerationProvider>
      <Outlet />
    </PresentationGenerationProvider>
  );
};

export default {
  DetailPage,
  PresentationOutlinePage,
  PresentationListPage,
  ThumbnailDemoPage,
  Layout,
};
