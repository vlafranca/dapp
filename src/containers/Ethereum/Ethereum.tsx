import { FC } from "react";
import ConnectWalletGuard from "../../components/ConnectWalletGuard/ConnectWalletGuard";

interface EthereumProps {}

const Ethereum: FC<EthereumProps> = () => (
  <ConnectWalletGuard>
    <div>Ethereum page</div>
  </ConnectWalletGuard>
);

export default Ethereum;
