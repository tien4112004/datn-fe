import { Suspense } from 'react';
import PresentationWrapper from './components/PresentationWrapper';
import './layout.css';

const PresentationPage = () => {
  return (
    <main className="main-content">
      <Suspense fallback={<div>Loading editor…</div>}>
        <PresentationWrapper />
      </Suspense>
    </main>
  );
};

export default PresentationPage;
