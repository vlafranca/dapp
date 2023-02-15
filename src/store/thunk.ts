import { createAsyncThunk } from "@reduxjs/toolkit";
import { Alchemy, Network, TokenBalanceSuccess } from "alchemy-sdk";
import { ExternalApi } from "../types/external";
import { AppDispatch, RootState } from "./store";
import {
  setError,
  setEthTransacPrice,
  setNFTs,
  setToken,
  setTokenPrice,
  setTransactions,
  TokenDetail,
} from "./walletSlice";

const config = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

export const fetchEthTransactions = createAsyncThunk<
  void,
  undefined,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch;
    state: RootState;
  }
>("fetchEtherscanTransactions", async (_, thunkApi) => {
  fetch(
    `http://api.etherscan.io/api?module=account&action=txlist&address=${
      thunkApi.getState().wallet.walletAddress
    }&startblock=0&endblock=99999999&sort=asc&page=1&offset=10&apikey=${
      process.env.REACT_APP_ETHERSCAN_API_KEY
    }`
  )
    .then((data) => data.json())
    .then((data: { message: string; result: any; status: "0" | "1" }) => {
      if (data.status === "0") {
        thunkApi.dispatch(
          setError({ type: ExternalApi.Etherscan, message: data.result })
        );
        return;
      }
      thunkApi.dispatch(setTransactions(data.result));
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
  any,
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
    .then((data: any) =>
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
