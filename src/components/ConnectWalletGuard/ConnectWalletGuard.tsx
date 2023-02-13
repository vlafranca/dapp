import { FC } from "react";
import { Container } from "react-bootstrap";
import { useAppSelector } from "../../store/hooks";
import ConnectWallet from "../ConnectWallet/ConnectWallet";

interface ConnectWalletGuardProps {
  children: JSX.Element;
}

const ConnectWalletGuard: FC<ConnectWalletGuardProps> = ({ children }) => {
  const wallet = useAppSelector((state) => state.wallet);

  // TODO improve css for this
  if (!wallet.isMetamaskInstalled || !wallet.walletAddress) {
    return (
      <Container className="d-flex h-100 justify-content-center align-items-center">
        <ConnectWallet />
      </Container>
    );
  }

  return <Container>{children}</Container>;
};

export default ConnectWalletGuard;
