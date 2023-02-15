import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OwnedNft,
  OwnedNftsResponse,
  TokenBalanceSuccess,
  TokenMetadataResponse,
} from "alchemy-sdk";
import { EtherscanTransaction } from "../types/etherscan";
import { ExternalApi } from "../types/external";
import {
  fetchEthTransactions,
  fetchNFTs,
  fetchTokenInfo,
  fetchTokens,
} from "./thunk";

export interface TokenDetail
  extends TokenMetadataResponse,
    TokenBalanceSuccess {
  price?: number;
}

export interface TransactionDetail extends EtherscanTransaction {
  price?: number;
}

// Define a type for the slice state
export interface WalletState {
  isMetamaskInstalled: boolean;
  walletAddress: string | null;
  balance: string;
  networkId: number;
  ethereum: {
    loading: boolean;
    hasData: boolean;
    page: number;
    transactions?: TransactionDetail[];
  };
  tokens: {
    loading: boolean;
    hasData: boolean;
    totalPrice: number;
    data?: TokenDetail[];
  };
  nfts: {
    loading: boolean;
    hasData: boolean;
    data?: OwnedNft[][];
  };
  errors: { type: string; message: string }[];
}

// Define the initial state using that type
const initialState: WalletState = {
  isMetamaskInstalled: false,
  walletAddress: null,
  balance: "0",
  networkId: 1,
  ethereum: {
    loading: false,
    hasData: false,
    page: 1,
  },
  tokens: {
    loading: false,
    hasData: false,
    totalPrice: 0,
  },
  nfts: {
    loading: false,
    hasData: false,
  },
  errors: [],
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    reset: (state) => {
      state = initialState;
    },
    setMetamasInstalled: (state) => {
      state.isMetamaskInstalled = true;
    },
    unsetMetamasInstalled: (state) => {
      state.isMetamaskInstalled = false;
    },
    setWalletAddress: (
      state,
      action: PayloadAction<{
        address: string;
        balance: string;
        networkId: number;
      }>
    ) => {
      state.walletAddress = action.payload.address;
      state.balance = action.payload.balance;
      state.networkId = action.payload.networkId;
    },
    unsetWalletAddress: (state) => {
      state.walletAddress = null;
    },
    updateNetwork: (state, action: PayloadAction<number>) => {
      state.networkId = action.payload;
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action: PayloadAction<EtherscanTransaction[]>) => {
      state.ethereum.transactions = action.payload;
      state.ethereum.hasData = true;
      state.ethereum.loading = false;
      state.ethereum.page = 1;
    },
    pushTransactions: (
      state,
      action: PayloadAction<EtherscanTransaction[]>
    ) => {
      state.ethereum.transactions = [
        ...(state.ethereum.transactions || []),
        ...action.payload,
      ];
      state.ethereum.page = state.ethereum.page + 1;
      state.ethereum.hasData = true;
      state.ethereum.loading = false;
    },
    setToken: (state, action: PayloadAction<TokenDetail>) => {
      if (!state.tokens.data) state.tokens.data = [];
      state.tokens.hasData = true;
      state.tokens.loading = false;

      const existingIndex = state.tokens.data.findIndex(
        (t) => t.contractAddress === action.payload.contractAddress
      );
      if (existingIndex > -1) {
        state.tokens.data[existingIndex] = action.payload;
      } else {
        state.tokens.data.push(action.payload);
      }
    },
    setNFTs: (state, action: PayloadAction<OwnedNftsResponse>) => {
      state.nfts.hasData = true;
      state.nfts.loading = false;

      state.nfts.data = Object.values(
        action.payload.ownedNfts.reduce<{ [key: string]: OwnedNft[] }>(
          (acc, nft) => {
            if (!acc[nft.contract.address]) acc[nft.contract.address] = [];

            acc[nft.contract.address].push(nft);
            return acc;
          },
          {}
        )
      );
    },
    setTokenPrice: (
      state,
      action: PayloadAction<{ contractAddress: string; price: number }>
    ) => {
      if (!state.tokens.data) return;

      const token = state.tokens.data.find(
        (token) => token.contractAddress === action.payload.contractAddress
      );
      if (token) token.price = action.payload.price;
      state.tokens.totalPrice = state.tokens.data.reduce(
        (acc, v) => acc + (v.price || 0),
        0
      );
    },
    setEthTransacPrice: (
      state,
      action: PayloadAction<{ transaction: any; price: number }>
    ) => {
      if (!state.ethereum.transactions) return;

      const tr = state.ethereum.transactions.find(
        (tr) => tr.timeStamp === action.payload.transaction.timeStamp
      );
      if (tr) tr.price = action.payload.price;
    },
    setError: (
      state,
      action: PayloadAction<{ message: string; type: ExternalApi }>
    ) => {
      console.log(action);
      state.errors.push(action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchEthTransactions.pending, (state, action) => {
      state.ethereum.loading = true;
    });
    builder.addCase(fetchTokens.pending, (state, action) => {
      state.tokens.loading = true;
    });
    builder.addCase(fetchTokenInfo.pending, (state, action) => {
      state.tokens.loading = true;
    });
    builder.addCase(fetchNFTs.pending, (state) => {
      state.nfts.loading = true;
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  reset,
  setMetamasInstalled,
  unsetMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
  updateNetwork,
  updateBalance,
  setTransactions,
  pushTransactions,
  setToken,
  setNFTs,
  setTokenPrice,
  setEthTransacPrice,
  setError,
} = walletSlice.actions;

export default walletSlice.reducer;
