import { FC, useEffect, useRef } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "../../errors/ErrorBoundary";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setMetamasInstalled, setWalletAddress } from "../../store/walletSlice";
import ConnectWallet from "../ConnectWallet/ConnectWallet";

interface ConnectWalletGuardProps {
  children: JSX.Element;
}

const ConnectWalletGuard: FC<ConnectWalletGuardProps> = ({ children }) => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Parse query params on init
   */
  useEffect(() => {
    if (searchParams.has("wallet")) {
      dispatch(setMetamasInstalled());
      dispatch(
        setWalletAddress({
          address: searchParams.get("wallet") as string,
          balance: "0",
          networkId: 1,
        })
      );
    }
  }, []);

  const searchAddress = () => {
    const inputValue = inputRef.current?.value;
    if (!inputValue) return;
    dispatch(setMetamasInstalled());
    dispatch(
      setWalletAddress({
        address: inputValue,
        balance: "0",
        networkId: 1,
      })
    );
    setSearchParams({
      wallet: inputValue,
    });
  };

  // TODO improve css for this
  if (!wallet.isMetamaskInstalled || !wallet.walletAddress) {
    return (
      <Container className="d-flex h-100 justify-content-center align-items-center flex-column content">
        <ConnectWallet />
        <Row className="mt-4 mb-4">
          <Col className="text-center">OR</Col>
        </Row>
        <Container>
          <Row>
            <Col className="mb-2">
              <Form.Control
                type="text"
                id="address"
                aria-describedby="wallet_address"
                placeholder="Enter ERC-20 wallet address"
                ref={inputRef}
              />
            </Col>
            <Col className="mb-2 text-center" xs="12" sm="auto">
              <Button variant="primary" type="submit" onClick={searchAddress}>
                Search
              </Button>
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container className="mt-2 pb-4 content">{children}</Container>
    </ErrorBoundary>
  );
};

export default ConnectWalletGuard;
