import detectEthereumProvider from "@metamask/detect-provider";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  Alchemy,
  AlchemySettings,
  Network,
  TokenBalanceSuccess,
} from "alchemy-sdk";
import axios, { AxiosError } from "axios";
import * as uuid from "uuid";
import Web3 from "web3";
import { CoinGeckoHistoricalResponse } from "../types/coingecko";
import { EtherscanResponse, EtherscanTransaction } from "../types/etherscan";
import { ExternalApi } from "../types/external";
import { EthNetworks, NetworkAlchemyMapping } from "../types/web3";
import { AppDispatch, RootState } from "./store";
import {
  init,
  pushTransactions,
  reset,
  resetItems,
  setError,
  setEthTransacPrice,
  setMetamasInstalled,
  setNetwork,
  setNFTs,
  setToken,
  setTokenPrice,
  setTransactions,
  setWalletAddress,
  TokenDetail,
  TransactionDetail,
  updateBalance,
} from "./walletSlice";

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const web3 = new Web3(Web3.givenProvider);

const config: AlchemySettings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
let alchemy = new Alchemy(config);

export const EtherscanEndpoints: { [key: number]: string } = {
  [EthNetworks.MainNet]: "http://api.etherscan.io",
  [EthNetworks.Goerli]: "http://api-goerli.etherscan.io",
};

/**
 *  Sync thunks
 */
export const configureAlchemy =
  (network: Network) => (dispatch: AppDispatch) => {
    alchemy = new Alchemy({ ...config, network });
    dispatch(resetItems());
  };

export const initWalletConnection =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const provider = await detectEthereumProvider();
    provider?.isMetaMask && dispatch(setMetamasInstalled());

    provider?.on("networkChanged", async (networkId: number) => {
      dispatch(setNetwork(networkId));
      dispatch(resetItems());
      dispatch(
        updateBalance(
          web3.utils.fromWei(
            await web3.eth.getBalance(getState().wallet.walletAddress as string)
          )
        )
      );
      dispatch(configureAlchemy(NetworkAlchemyMapping[networkId]));
    });
    provider?.on("accountsChanged", async (accounts: string[]) => {
      dispatch(reset());
      dispatch(initUser(accounts[0]));
    });
    dispatch(init);
  };

export const initUser =
  (walletAddress: string) => async (dispatch: AppDispatch) => {
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(walletAddress)
    );
    const networkId = await web3.eth.net.getId();
    dispatch(setWalletAddress({ address: walletAddress, balance, networkId }));
  };

/**
 * Async thunks
 */
export const connectWallet = createAsyncThunk<
  void,
  undefined,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("connectWallet", async (_, thunkApi) => {
  try {
    const accounts = await web3.eth.requestAccounts();
    thunkApi.dispatch(initUser(accounts[0]));
  } catch (error: any) {
    alert(`Something went wrong: ${error}`);
  }
});

export const fetchEthBalance = createAsyncThunk<
  void,
  undefined,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchEthBalance", async (_, thunkApi) => {
  fetch(
    `${
      EtherscanEndpoints[thunkApi.getState().wallet.networkId]
    }/api?module=account&action=balance&address=${
      thunkApi.getState().wallet.walletAddress
    }&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
  )
    .then((data) => data.json())
    .then((data: EtherscanResponse) => {
      if (data.status === "0" && typeof data.result === "string") {
        thunkApi.dispatch(
          setError({
            type: ExternalApi.Etherscan,
            message: data.result as string,
            id: uuid.v4(),
          })
        );
        return;
      }
      thunkApi.dispatch(
        updateBalance(Web3.utils.fromWei(data.result as string))
      );
    })
    .catch((err) => thunkApi.dispatch(setError({ ...err, id: uuid.v4() })));
});

export const fetchEthTransactions = createAsyncThunk<
  void,
  number,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchEtherscanTransactions", async (page, thunkApi) => {
  fetch(
    `${
      EtherscanEndpoints[thunkApi.getState().wallet.networkId]
    }/api?module=account&action=txlist&address=${
      thunkApi.getState().wallet.walletAddress
    }&startblock=0&endblock=99999999&sort=asc&page=${page}&offset=10&apikey=${
      process.env.REACT_APP_ETHERSCAN_API_KEY
    }`
  )
    .then((data) => data.json())
    .then((data: EtherscanResponse) => {
      if (data.status === "0" && typeof data.result === "string") {
        thunkApi.dispatch(
          setError({
            type: ExternalApi.Etherscan,
            message: data.result as string,
            id: uuid.v4(),
          })
        );
        return;
      }
      if (page === 1) {
        thunkApi.dispatch(
          setTransactions(data.result as EtherscanTransaction[])
        );
      } else {
        thunkApi.dispatch(
          pushTransactions(data.result as EtherscanTransaction[])
        );
      }
    })
    .catch((err) => thunkApi.dispatch(setError({ ...err, id: uuid.v4() })));
});

export const fetchTokens = createAsyncThunk<
  void,
  undefined,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchTokenContractsForAddress", async (_, thunkApi) => {
  alchemy.core
    .getTokenBalances(thunkApi.getState().wallet.walletAddress as string)
    .then((res) => {
      res.tokenBalances.forEach((balance) => {
        thunkApi.dispatch(fetchTokenInfo(balance as TokenBalanceSuccess));
      });
    })
    .catch((err) => {
      thunkApi.dispatch(
        setError({
          type: ExternalApi.AlchemySdk,
          message: JSON.parse(err.body).error.message,
          id: uuid.v4(),
        })
      );
    });
});

export const fetchTokenInfo = createAsyncThunk<
  void,
  TokenBalanceSuccess,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchTokenContractDetails", async (token: TokenBalanceSuccess, thunkApi) => {
  alchemy.core
    .getTokenMetadata(token.contractAddress)
    .then((resp) => {
      thunkApi.dispatch(setToken({ ...resp, ...token }));
    })
    .catch((err: { status: number; body: string; code: string }) => {
      thunkApi.dispatch(
        setError({
          type: ExternalApi.AlchemySdk,
          message: JSON.parse(err.body).error.message,
          id: uuid.v4(),
        })
      );
    });
});

export const fetchNFTs = createAsyncThunk<
  void,
  undefined,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchNFTs", async (_, thunkApi) => {
  alchemy.nft
    .getNftsForOwner(thunkApi.getState().wallet.walletAddress as string)
    .then((res) => {
      thunkApi.dispatch(setNFTs(res));
    })
    .catch((err) =>
      thunkApi.dispatch(
        setError({
          type: ExternalApi.AlchemySdk,
          message: JSON.parse(err.body).error.message,
          id: uuid.v4(),
        })
      )
    );
});

export const fetchPrice = createAsyncThunk<
  void,
  TokenDetail,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchPrice", async (token, thunkApi) => {
  axios
    .get(
      (isLocal // should be configured in environment used in build steps
        ? "/coingecko"
        : "https://api.coingecko.com/api/v3") +
        `/simple/token_price/ethereum?contract_addresses=${token.contractAddress}&vs_currencies=USD`
    )
    .then((resp) => resp.data)
    .then(
      (price: {
        [key: string]: {
          usd: number;
        };
      }) =>
        thunkApi.dispatch(
          setTokenPrice({
            contractAddress: token.contractAddress,
            price:
              price[token.contractAddress] && price[token.contractAddress].usd,
          })
        )
    )
    .catch((err: AxiosError) =>
      thunkApi.dispatch(
        setError({
          type: ExternalApi.CoinGecko,
          message: err.message,
          id: uuid.v4(),
        })
      )
    );
});

export const fetchHistoricalPrice = createAsyncThunk<
  void,
  TransactionDetail,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchHistoricalPrice", async (transaction, thunkApi) => {
  const date = new Date(parseInt(transaction.timeStamp) * 1000);

  axios
    .get(
      (isLocal // should be configured in environment used in build steps
        ? "/coingecko"
        : "https://api.coingecko.com/api/v3") +
        `/coins/ethereum/history?date=${date.getDate()}-${
          date.getUTCMonth() + 1
        }-${date.getFullYear()}&localization=false`
    )
    .then((resp) => resp.data)
    .then((data: CoinGeckoHistoricalResponse) =>
      thunkApi.dispatch(
        setEthTransacPrice({
          transaction,
          price: data.market_data.current_price.usd,
        })
      )
    )
    .catch((err: AxiosError) =>
      thunkApi.dispatch(
        setError({
          type: ExternalApi.CoinGecko,
          message: err.message,
          id: uuid.v4(),
        })
      )
    );
});
