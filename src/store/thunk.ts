import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  Alchemy,
  AlchemySettings,
  Network,
  TokenBalanceSuccess,
} from "alchemy-sdk";
import { CoinGeckoHistoricalResponse } from "../types/coingecko";
import {
  EtherscanTransaction,
  EtherscanTxListResponse,
} from "../types/etherscan";
import { ExternalApi } from "../types/external";
import { EthNetworks } from "../types/web3";
import { AppDispatch, RootState } from "./store";
import {
  pushTransactions,
  resetItems,
  setError,
  setEthTransacPrice,
  setNFTs,
  setToken,
  setTokenPrice,
  setTransactions,
  TokenDetail,
  TransactionDetail,
} from "./walletSlice";

const config: AlchemySettings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
let alchemy = new Alchemy(config);

export const EtherscanEndpoints: { [key: number]: string } = {
  [EthNetworks.MainNet]: "http://api.etherscan.io",
  [EthNetworks.Goerli]: "http://api-goerli.etherscan.io",
};

export const configureAlchemy =
  (network: Network) => (dispatch: AppDispatch) => {
    alchemy = new Alchemy({ ...config, network });
    dispatch(resetItems());
  };

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
    .then((data: EtherscanTxListResponse) => {
      if (data.status === "0" && typeof data.result === "string") {
        thunkApi.dispatch(
          setError({
            type: ExternalApi.Etherscan,
            message: data.result as string,
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
    .catch((err) => thunkApi.dispatch(setError(err)));
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
      thunkApi.dispatch(setToken({ ...resp, ...token, price: 0 }));
    })
    .catch((err: { status: number; body: string; code: string }) => {
      thunkApi.dispatch(
        setError({
          type: ExternalApi.AlchemySdk,
          message: JSON.parse(err.body).error.message,
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
  fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.contractAddress}&vs_currencies=USD`
  )
    .then((resp) => resp.json())
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
    .catch((err) =>
      thunkApi.dispatch(
        setError({
          type: ExternalApi.CoinGecko,
          message: JSON.stringify(err),
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

  fetch(
    `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date.getDate()}-${
      date.getUTCMonth() + 1
    }-${date.getFullYear()}&localization=false`
  )
    .then((resp) => resp.json())
    .then((data: CoinGeckoHistoricalResponse) =>
      thunkApi.dispatch(
        setEthTransacPrice({
          transaction,
          price: data.market_data.current_price.usd,
        })
      )
    )
    .catch((err) =>
      thunkApi.dispatch(
        setError({
          type: ExternalApi.CoinGecko,
          message: JSON.stringify(err),
        })
      )
    );
});
