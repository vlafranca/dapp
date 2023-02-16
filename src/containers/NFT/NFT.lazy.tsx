import React, { lazy, Suspense } from "react";

const LazyNft = lazy(() => import("./NFT"));

const Nft = (
  props: JSX.IntrinsicAttributes & { children?: React.ReactNode }
) => (
  <Suspense fallback={null}>
    <LazyNft {...props} />
  </Suspense>
);

export default Nft;
