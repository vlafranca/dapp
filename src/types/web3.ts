export enum EthNetworks {
  MainNet = 1,
  Goerli = 5,
}

export const EthNetworkNameMapping: { [key: number]: string } = {
  [EthNetworks.MainNet]: "MainNet",
  [EthNetworks.Goerli]: "Goerli",
};
