import React, { lazy, Suspense } from 'react';

const LazyEthereum = lazy(() => import('./Ethereum'));

const Ethereum = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazyEthereum {...props} />
  </Suspense>
);

export default Ethereum;
