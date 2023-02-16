import { FC, useContext } from "react";
import { Dropdown, DropdownButton, Spinner } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import ThemeContext from "../../contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { connectWallet } from "../../store/thunk";
import { reset, unsetWalletAddress } from "../../store/walletSlice";
import ThemeButton from "../ThemeButton/ThemeButton";

interface ConnectWalletProps {}

const ConnectWallet: FC<ConnectWalletProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const [, setSearchParams] = useSearchParams();
  const [theme] = useContext(ThemeContext);

  function connect(): void {
    dispatch(connectWallet());
  }

  function disconnectWallet(): void {
    dispatch(unsetWalletAddress());
    dispatch(reset());
    setSearchParams({});
  }

  if (!wallet.isMetamaskInstalled) {
    return (
      <ThemeButton onClick={connect} disabled={wallet.connecting}>
        {wallet.connecting ? (
          <>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </>
        ) : (
          <>Install Metamask</>
        )}
      </ThemeButton>
    );
  }

  return !wallet.walletAddress ? (
    <ThemeButton onClick={connect} disabled={wallet.connecting}>
      {wallet.connecting ? (
        <>
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          Loading...
        </>
      ) : (
        <>Connect Wallet</>
      )}
    </ThemeButton>
  ) : (
    <DropdownButton
      align="end"
      id="dropdown-basic-button"
      title={wallet.walletAddress}
      variant={theme.buttons}>
      <Dropdown.Item onClick={disconnectWallet}>Disconnect</Dropdown.Item>
    </DropdownButton>
  );
};

export default ConnectWallet;
