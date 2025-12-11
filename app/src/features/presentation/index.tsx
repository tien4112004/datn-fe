import DetailPage from '@/features/presentation/pages/PresentationDetailPage';
import PresentationOutlinePage from '@/features/presentation/pages/PresentationOutlinePage';
import PresentationListPage from './pages/PresentationListPage';
import ThumbnailDemoPage from './pages/ThumbnailDemoPage';
import { moduleMethodMap } from './components/remote/module';

moduleMethodMap['method']().then((mod) => {
  (mod.default as any).initializeFonts();
});

export default {
  DetailPage,
  PresentationOutlinePage,
  PresentationListPage,
  ThumbnailDemoPage,
};
