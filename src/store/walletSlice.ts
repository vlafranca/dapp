import { createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface WalletState {
  isMetamaskInstalled: boolean;
  walletAddress: string | null;
}

// Define the initial state using that type
const initialState: WalletState = {
  isMetamaskInstalled: false,
  walletAddress: null,
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
    setWalletAddress: (state, action) => {
      state.walletAddress = action.payload;
    },
    unsetWalletAddress: (state) => {
      state.walletAddress = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setMetamasInstalled,
  unsetMetamasInstalled,
  setWalletAddress,
  unsetWalletAddress,
} = walletSlice.actions;

export default walletSlice.reducer;
