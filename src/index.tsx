import { FC, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux/es/exports";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import ConnectWalletGuard from "./components/ConnectWalletGuard/ConnectWalletGuard";
import Ethereum from "./containers/Ethereum/Ethereum";
import NFT from "./containers/NFT/NFT";
import NotFound from "./containers/NotFound/NotFound";
import Tokens from "./containers/Tokens/Tokens";
import { LightTheme, ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const RootComponent: FC<any> = () => {
  const [theme, setTheme] = useState(LightTheme);
  return (
    <Provider store={store}>
      <ThemeProvider value={[theme, setTheme]}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Navigate to="/ethereum" />} />
              <Route
                path="ethereum"
                element={
                  <ConnectWalletGuard>
                    <Ethereum />
                  </ConnectWalletGuard>
                }
              />
              <Route
                path="tokens"
                element={
                  <ConnectWalletGuard>
                    <Tokens />
                  </ConnectWalletGuard>
                }
              />
              <Route
                path="nft"
                element={
                  <ConnectWalletGuard>
                    <NFT />
                  </ConnectWalletGuard>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

root.render(<RootComponent />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
