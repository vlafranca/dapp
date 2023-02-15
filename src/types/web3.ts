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
