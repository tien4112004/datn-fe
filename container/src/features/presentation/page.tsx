import { Suspense } from 'react';
import PresentationWrapper from './components/PresentationWrapper';

const PresentationPage = () => {
  return (
    <Suspense fallback={<div>Loading editor…</div>}>
      <PresentationWrapper />
    </Suspense>
  );
};

export default PresentationPage;
