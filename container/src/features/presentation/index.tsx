import GlobalSpinner from '@/shared/components/common/GlobalSpinner';
import PresentationCard from './components/PresentationCard';

import { lazy, Suspense } from 'react';

const PresentationWrapper = lazy(() => import('./components/PresentationWrapper'));

const EditorPage = () => {
  return (
    // <Suspense fallback={<GlobalSpinner text="Loading presentation editor..." />}>
    <PresentationWrapper />
    // </Suspense>
  );
};

const DetailsPage = () => {
  return (
    <div className="max-w-2xl mx-auto my-8 p-4">
      <h1>Presentation Details</h1>
      <PresentationCard />
    </div>
  );
};

export { PresentationCard };
export { PresentationWrapper };

export default {
  EditorPage,
  DetailsPage,
};
