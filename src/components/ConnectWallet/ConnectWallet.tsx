import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useContext, useEffect } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import ThemeContext from "../../contexts/ThemeContext";
import Web3Context from "../../contexts/Web3Context";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  reset,
  setMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
} from "../../store/walletSlice";
import ThemeButton from "../ThemeButton/ThemeButton";

interface ConnectWalletProps {}

const ConnectWallet: FC<ConnectWalletProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const web3 = useContext(Web3Context);
  const [, setSearchParams] = useSearchParams();
  const [theme] = useContext(ThemeContext);

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
        // TODO put in thunk
        const balance = web3.utils.fromWei(
          await web3.eth.getBalance(accounts[0])
        );
        const networkId = await web3.eth.net.getId();
        dispatch(
          setWalletAddress({ address: accounts[0], balance, networkId })
        );
      })
      .catch((error: any) => {
        alert(`Something went wrong: ${error}`);
      });
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
      variant={theme.buttons}
    >
      <Dropdown.Item onClick={disconnectWallet}>Disconnect</Dropdown.Item>
    </DropdownButton>
  );
};

export default ConnectWallet;
