import PresentationCard from './components/PresentationCard';

import { lazy } from 'react';

const PresentationWrapper = lazy(() => import('./components/PresentationWrapper'));

const EditorPage = () => {
  return <PresentationWrapper />;
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
