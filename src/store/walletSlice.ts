import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OwnedNft,
  OwnedNftsResponse,
  TokenBalanceSuccess,
  TokenMetadataResponse,
} from "alchemy-sdk";
import { fetchEthTransactions, fetchTokenInfo, fetchTokens } from "./thunk";

export interface TokenDetail
  extends TokenMetadataResponse,
    TokenBalanceSuccess {}

// Define a type for the slice state
export interface WalletState {
  isMetamaskInstalled: boolean;
  walletAddress: string | null;
  balance: string;
  networkId: number;
  ethereum: {
    loading: boolean;
    hasData: boolean;
    transactions?: any[];
  };
  tokens: {
    loading: boolean;
    hasData: boolean;
    data?: TokenDetail[];
  };
  nfts: {
    loading: boolean;
    hasData: boolean;
    data?: OwnedNft[][];
  };
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
  },
  tokens: {
    loading: false,
    hasData: false,
  },
  nfts: {
    loading: false,
    hasData: false,
  },
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
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
    setTransactions: (state, action: PayloadAction<any[]>) => {
      state.ethereum.transactions = action.payload;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  setMetamasInstalled,
  unsetMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
  updateNetwork,
  updateBalance,
  setTransactions,
  setToken,
  setNFTs,
} = walletSlice.actions;

export default walletSlice.reducer;
