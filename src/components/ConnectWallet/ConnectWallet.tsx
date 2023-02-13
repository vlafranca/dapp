import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useContext, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
} from "../../store/walletSlice";
import Web3Context from "../../Web3Context";

interface ConnectWalletProps {}

const ConnectWallet: FC<ConnectWalletProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const web3 = useContext(Web3Context);

  useEffect(() => {
    const detectMetamask = async () => {
      const provider = await detectEthereumProvider();
      provider?.isMetaMask && dispatch(setMetamasInstalled());
    };
    detectMetamask();
  }, []);

  function connectWallet(): void {
    web3.eth
      .requestAccounts()
      .then(async (accounts: string[]) => {
        console.log(accounts, web3, await web3.eth.net.getId());
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
