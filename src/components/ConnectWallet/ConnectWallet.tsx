import detectEthereumProvider from "@metamask/detect-provider";
import { FC, useEffect, useState } from "react";
import { Button } from "react-bootstrap";

interface ConnectWalletProps {}

const ConnectWallet: FC<ConnectWalletProps> = () => {
  const [isMetamaskInstalled, setIsMetamaskInstalled] =
    useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const detectMetamask = async () => {
      const provider = await detectEthereumProvider();
      setIsMetamaskInstalled(provider?.isMetaMask || false);
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
        setAccount(accounts[0]);
      })
      .catch((error: any) => {
        alert(`Something went wrong: ${error}`);
      });
  }

  if (!isMetamaskInstalled) {
    return <Button onClick={connectWallet}>Install Metamask</Button>;
  }

  return !account ? (
    <Button onClick={connectWallet}>Connect Wallet</Button>
  ) : (
    <Button onClick={connectWallet}>{account}</Button>
  );
};

export default ConnectWallet;
