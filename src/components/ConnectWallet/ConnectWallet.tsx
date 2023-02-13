import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
} from "../../store/walletSlice";

interface ConnectWalletProps {}

const ConnectWallet: FC<ConnectWalletProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const detectMetamask = async () => {
      const provider = await detectEthereumProvider();
      provider?.isMetaMask && dispatch(setMetamasInstalled());
    };
    detectMetamask();
  }, []);

  async function connectWallet(): Promise<void> {
    //to get around type checking
    (window as any).ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts: string[]) => {
        dispatch(setWalletAddress(accounts[0]));
      })
      .catch((error: any) => {
        alert(`Something went wrong: ${error}`);
      });
  }

  function disconnectWallet(): void {
    dispatch(unsetWalletAddress());
  }

  if (!wallet.isMetamaskInstalled) {
    return <Button onClick={connectWallet}>Install Metamask</Button>;
  }

  return !wallet.walletAddress ? (
    <Button onClick={connectWallet}>Connect Wallet</Button>
  ) : (
    <Button onClick={disconnectWallet}>{wallet.walletAddress}</Button>
  );
};

export default ConnectWallet;
