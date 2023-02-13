import { FC } from "react";
import ConnectWalletGuard from "../../components/ConnectWalletGuard/ConnectWalletGuard";

interface NFTProps {}

const NFT: FC<NFTProps> = () => (
  <ConnectWalletGuard>
    <div>Nft Component</div>
  </ConnectWalletGuard>
);

export default NFT;
