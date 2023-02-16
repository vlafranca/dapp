import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OwnedNft,
  OwnedNftsResponse,
  TokenBalanceSuccess,
  TokenMetadataResponse,
} from "alchemy-sdk";
import Web3 from "web3";
import { EtherscanTransaction } from "../types/etherscan";
import { ExternalApi } from "../types/external";
import { EthNetworks } from "../types/web3";
import {
  connectWallet,
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
  networkId: EthNetworks;
  init: boolean;
  connecting: boolean;
  ethereum: {
    loading: boolean;
    loadingMore: boolean;
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
  errors: { type: string; message: string; id: string }[];
}

// Define the initial state using that type
const initialState: WalletState = {
  isMetamaskInstalled: false,
  walletAddress: null,
  balance: "0",
  networkId: EthNetworks.MainNet,
  init: false,
  connecting: false,
  ethereum: {
    loading: false,
    loadingMore: false,
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
    init: (state) => {
      state.init = true;
    },
    reset: (state) => ({
      ...initialState,
      init: state.init,
      isMetamaskInstalled: state.isMetamaskInstalled,
    }),
    resetItems: (state) => {
      state = {
        ...state,
        ethereum: initialState.ethereum,
        tokens: initialState.tokens,
        nfts: initialState.nfts,
        errors: [],
      };

      return state;
    },
    setNetwork: (state, action: PayloadAction<EthNetworks>) => {
      state.networkId = action.payload;
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
        networkId: EthNetworks;
      }>
    ) => {
      state.walletAddress = action.payload.address;
      state.balance = action.payload.balance;
      state.networkId = action.payload.networkId;
      state.connecting = false;
    },
    unsetWalletAddress: (state) => {
      state.walletAddress = null;
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
      state.ethereum.loadingMore = false;
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
      state.tokens.totalPrice = state.tokens.data.reduce((acc, v) => {
        let balance = 0;
        try {
          // sometimes wei value is invalid so just ignore the error
          balance = parseFloat(Web3.utils.fromWei(v.tokenBalance));
        } catch (_) {}
        return acc + (v.price || 0) * balance;
      }, 0);
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
      action: PayloadAction<{
        message: string;
        type: ExternalApi | string;
        id: string;
      }>
    ) => {
      state.errors.push(action.payload);
    },
    rmError: (state, action: PayloadAction<string>) => {
      state.errors.splice(
        state.errors.findIndex((err) => err.id === action.payload),
        1
      );
      return state;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchEthTransactions.pending, (state, action) => {
      // arg is page number parameter
      if (action.meta.arg === 1) {
        state.ethereum.loading = true;
      } else {
        state.ethereum.loadingMore = true;
      }
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
    builder.addCase(connectWallet.pending, (state) => {
      state.connecting = true;
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  init,
  reset,
  setMetamasInstalled,
  unsetMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
  updateBalance,
  setTransactions,
  pushTransactions,
  setToken,
  setNFTs,
  setTokenPrice,
  setEthTransacPrice,
  setError,
  resetItems,
  setNetwork,
  rmError,
} = walletSlice.actions;

export default walletSlice.reducer;
