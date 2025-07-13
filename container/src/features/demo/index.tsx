import GlobalSpinner from '@/shared/components/common/GlobalSpinner.tsx';
import { lazy, Suspense } from 'react';

const CardDemos = lazy(() => import('../../shared/components/cards/index.tsx'));

const CardDemoPage = () => {
  return (
    // <Suspense fallback={<GlobalSpinner text="Loading presentation editor..." />}>
    <CardDemos />
    // </Suspense>
  );
};

export default { CardDemoPage };
