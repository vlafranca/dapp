import { configureStore } from "@reduxjs/toolkit";
import walletReducer, { setTransactions } from "./walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;

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
