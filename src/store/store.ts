import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./walletSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;
