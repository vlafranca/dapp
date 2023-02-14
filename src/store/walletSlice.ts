import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export interface WalletState {
  isMetamaskInstalled: boolean;
  walletAddress: string | null;
  balance: string;
  networkId: number;
  ethereum: {
    transactions?: any[];
  } | null;
}

// Define the initial state using that type
const initialState: WalletState = {
  isMetamaskInstalled: false,
  walletAddress: null,
  balance: "0",
  networkId: 1,
  ethereum: null,
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
      if (!state.ethereum) state.ethereum = {};
      state.ethereum.transactions = action.payload;
    },
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
} = walletSlice.actions;

export default walletSlice.reducer;
