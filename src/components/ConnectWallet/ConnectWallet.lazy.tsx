import React, { lazy, Suspense } from 'react';

const LazyConnectWallet = lazy(() => import('./ConnectWallet'));

const ConnectWallet = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazyConnectWallet {...props} />
  </Suspense>
);

export default ConnectWallet;
