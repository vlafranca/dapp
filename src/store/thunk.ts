import { createAsyncThunk } from "@reduxjs/toolkit";
import { Alchemy, Network, TokenBalanceSuccess } from "alchemy-sdk";
import { AppDispatch, RootState } from "./store";
import { setNFTs, setToken, setTransactions } from "./walletSlice";

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
    .then((data) => {
      thunkApi.dispatch(setTransactions(data.result));
    });
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
    .catch(alert);
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
    .catch(alert);
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
    .catch(alert);
});
