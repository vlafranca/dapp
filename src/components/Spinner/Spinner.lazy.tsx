import React, { lazy, Suspense } from 'react';

const LazySpinner = lazy(() => import('./Spinner'));

const Spinner = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazySpinner {...props} />
  </Suspense>
);

export default Spinner;
