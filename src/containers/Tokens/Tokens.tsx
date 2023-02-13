import { FC } from "react";
import ConnectWalletGuard from "../../components/ConnectWalletGuard/ConnectWalletGuard";

interface TokensProps {}

const Tokens: FC<TokensProps> = () => (
  <ConnectWalletGuard>
    <div>Tokens Component</div>
  </ConnectWalletGuard>
);

export default Tokens;
