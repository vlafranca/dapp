import { Network } from "alchemy-sdk";

export enum EthNetworks {
  MainNet = 1,
  Goerli = 5,
}

export const EthNetworkNameMapping: { [key: number]: string } = {
  [EthNetworks.MainNet]: "MainNet",
  [EthNetworks.Goerli]: "Goerli",
};

export const NetworkAlchemyMapping: { [key: number]: Network } = {
  [EthNetworks.MainNet]: Network.ETH_MAINNET,
  [EthNetworks.Goerli]: Network.ETH_GOERLI,
};

// exported from @metamask/detect-provider
export interface MetaMaskEthereumProvider {
  isMetaMask?: boolean;
  once(eventName: string | symbol, listener: (...args: any[]) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this;
  addListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  removeListener(
    eventName: string | symbol,
    listener: (...args: any[]) => void
  ): this;
  removeAllListeners(event?: string | symbol): this;
}
