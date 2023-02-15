import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useContext, useEffect, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import ThemeContext from "../../contexts/ThemeContext";
import Web3Context from "../../contexts/Web3Context";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  reset,
  resetItems,
  setMetamasInstalled,
  setNetwork,
  setWalletAddress,
  unsetWalletAddress,
} from "../../store/walletSlice";
import { MetaMaskEthereumProvider } from "../../types/web3";
import ThemeButton from "../ThemeButton/ThemeButton";

interface ConnectWalletProps {}

const ConnectWallet: FC<ConnectWalletProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const web3 = useContext(Web3Context);
  const [, setSearchParams] = useSearchParams();
  const [theme] = useContext(ThemeContext);
  const [web3Provider, setWeb3Provider] =
    useState<MetaMaskEthereumProvider | null>(null);

  useEffect(() => {
    if (web3Provider) return;

    const detectMetamask = async () => {
      const provider = await detectEthereumProvider();
      provider?.isMetaMask && dispatch(setMetamasInstalled());
      provider?.on("networkChanged", (networkId: number) => {
        dispatch(setNetwork(networkId));
        dispatch(resetItems());
      });
      provider?.on("accountsChanged", async (accounts: string[]) => {
        dispatch(reset());
        initUser(accounts[0]);
      });
      setWeb3Provider(provider);
    };

    detectMetamask();
  }, []);

  function connectWallet(): void {
    web3.eth
      .requestAccounts()
      .then(async (accounts: string[]) => {
        // TODO put in thunk
        initUser(accounts[0]);
      })
      .catch((error: any) => {
        alert(`Something went wrong: ${error}`);
      });
  }

  async function initUser(walletAddress: string) {
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(walletAddress)
    );
    const networkId = await web3.eth.net.getId();
    dispatch(setWalletAddress({ address: walletAddress, balance, networkId }));
  }

  function disconnectWallet(): void {
    dispatch(unsetWalletAddress());
    dispatch(reset());
    setSearchParams({});
  }

  if (!wallet.isMetamaskInstalled) {
    return <ThemeButton onClick={connectWallet}>Install Metamask</ThemeButton>;
  }

  return !wallet.walletAddress ? (
    <ThemeButton onClick={connectWallet}>Connect Wallet</ThemeButton>
  ) : (
    <DropdownButton
      align="end"
      id="dropdown-basic-button"
      title={wallet.walletAddress}
      variant={theme.buttons}>
      <Dropdown.Item onClick={disconnectWallet}>Disconnect</Dropdown.Item>
    </DropdownButton>
  );
};

export default ConnectWallet;
