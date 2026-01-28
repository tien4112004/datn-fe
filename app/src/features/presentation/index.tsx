import DetailPage from '@/features/presentation/pages/PresentationDetailPage';
import PresentationOutlinePage from '@/features/presentation/pages/PresentationOutlinePage';
import PresentationEmbedPage from '@/features/presentation/pages/PresentationEmbedPage';
import StudentPresentationPage from '@/features/presentation/pages/StudentPresentationPage';
import { moduleMethodMap } from './components/remote/module';

moduleMethodMap['method']().then((mod) => {
  (mod.default as any).initializeFonts();
});

export default {
  DetailPage,
  PresentationOutlinePage,
  PresentationEmbedPage,
  StudentPresentationPage,
};
