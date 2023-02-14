import { Alchemy, Network, TokenBalanceSuccess } from "alchemy-sdk";
import { RootState } from "./store";
import { setToken, setTransactions } from "./walletSlice";

const config = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

export const fetchEthTransactions =
  () => async (dispatch: any, getState: () => RootState) => {
    fetch(
      `http://api.etherscan.io/api?module=account&action=txlist&address=${
        getState().wallet.walletAddress
      }&startblock=0&endblock=99999999&sort=asc&page=1&offset=10&apikey=${
        process.env.REACT_APP_ETHERSCAN_API_KEY
      }`
    )
      .then((data) => data.json())
      .then((data) => {
        dispatch(setTransactions(data.result));
      });
  };

export const fetchTokens =
  () => async (dispatch: any, getState: () => RootState) => {
    alchemy.core
      .getTokenBalances(getState().wallet.walletAddress as string)
      .then((res) => {
        res.tokenBalances.forEach((balance) => {
          dispatch(fetchTokenInfo(balance as TokenBalanceSuccess));
        });
      })
      .catch(alert);
  };

export const fetchTokenInfo =
  (token: TokenBalanceSuccess) =>
  async (dispatch: any, getState: () => RootState) => {
    alchemy.core
      .getTokenMetadata(token.contractAddress)
      .then((resp) => {
        dispatch(setToken({ ...resp, ...token }));
      })
      .catch(alert);
  };
