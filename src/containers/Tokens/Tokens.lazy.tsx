import React, { lazy, Suspense } from 'react';

const LazyTokens = lazy(() => import('./Tokens'));

const Tokens = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazyTokens {...props} />
  </Suspense>
);

export default Tokens;
