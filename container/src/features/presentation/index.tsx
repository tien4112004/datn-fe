import DetailPage from '@/features/presentation/pages/PresentationDetailPage';
import DetailPage2 from '@/features/presentation/pages/PresentationDetailPage2';
import PresentationOutlinePage from '@/features/presentation/pages/PresentationOutlinePage';
import PresentationListPage from './pages/PresentationListPage';
import ThumbnailDemoPage from './pages/ThumbnailDemoPage';
import { Outlet } from 'react-router-dom';
import { PresentationGenerationProvider } from './contexts/PresentationGenerationContext';

const Layout = () => {
  return (
    <PresentationGenerationProvider>
      <Outlet />
    </PresentationGenerationProvider>
  );
};

export default {
  DetailPage,
  DetailPage2,
  PresentationOutlinePage,
  PresentationListPage,
  ThumbnailDemoPage,
  Layout,
};
