import React, { lazy, Suspense } from "react";

const LazyConnectWalletGuard = lazy(() => import("./ConnectWalletGuard"));

const ConnectWalletGuard = (
  props: JSX.IntrinsicAttributes & { children: React.ReactNode }
) => (
  <Suspense fallback={null}>
    {/* <LazyConnectWalletGuard {...props} /> */}
  </Suspense>
);

export default ConnectWalletGuard;
