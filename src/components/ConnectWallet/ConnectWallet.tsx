import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useContext, useEffect } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();

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
    setSearchParams({});
  }

  if (!wallet.isMetamaskInstalled) {
    return <Button onClick={connectWallet}>Install Metamask</Button>;
  }

  return !wallet.walletAddress ? (
    <Button onClick={connectWallet}>Connect Wallet</Button>
  ) : (
    <DropdownButton
      align="end"
      id="dropdown-basic-button"
      title={wallet.walletAddress}
    >
      <Dropdown.Item onClick={disconnectWallet}>Disconnect</Dropdown.Item>
    </DropdownButton>
  );
};

export default ConnectWallet;
