import { EventKey } from "@restart/ui/types";
import React, { FC, useContext, useEffect, useState } from "react";
import {
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Nav,
  Navbar,
  Row,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { BrightnessHighFill, MoonStarsFill } from "react-bootstrap-icons";
import { LinkContainer } from "react-router-bootstrap";
import { Outlet } from "react-router-dom";
import Web3 from "web3";
import "./App.scss";
import ConnectWallet from "./components/ConnectWallet/ConnectWallet";
import ThemeContext, { DarkTheme, LightTheme } from "./contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { initWalletConnection } from "./store/thunk";
import { rmError } from "./store/walletSlice";
import { EthNetworkNameMapping, EthNetworks } from "./types/web3";

const Networks = [EthNetworks.MainNet, EthNetworks.Goerli];

const App: React.FC = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useContext(ThemeContext);

  useEffect(() => {
    if (wallet.init) return;

    dispatch(initWalletConnection());
  }, []);

  async function changeNetwork(chainId: EventKey | null) {
    if (!chainId) return;
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: Web3.utils.toHex(chainId) }],
      });
    } catch (e: any) {
      alert(e.message);
      console.log(e);
    }
  }

  return (
    <div id="content" className={"bg-" + theme.secondary}>
      <header className="dark">
        <Navbar
          bg={theme.theme}
          variant={theme.theme}
          expand="lg"
          className="mb-2"
          collapseOnSelect>
          <Container>
            <Navbar.Brand href="#home">ZDAPP</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <LinkContainer
                  to={{
                    pathname: "/ethereum",
                    search: window.location.search,
                  }}>
                  <Nav.Link>Ethereum</Nav.Link>
                </LinkContainer>
                <LinkContainer
                  to={{
                    pathname: "/tokens",
                    search: window.location.search,
                  }}>
                  <Nav.Link>Tokens</Nav.Link>
                </LinkContainer>
                <LinkContainer
                  to={{ pathname: "/nft", search: window.location.search }}>
                  <Nav.Link>NFT</Nav.Link>
                </LinkContainer>
                <Nav.Link
                  onClick={() =>
                    setTheme(theme.theme === "dark" ? LightTheme : DarkTheme)
                  }>
                  {theme.theme === "dark" ? (
                    <span>
                      Light mode <BrightnessHighFill />
                    </span>
                  ) : (
                    <span>
                      Dark mode <MoonStarsFill />
                    </span>
                  )}
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>

            <Row direction="horizontal" className="justify-content-end" gap={3}>
              {wallet.walletAddress && (
                <>
                  <Col xs="auto">
                    <DropdownButton
                      id="dropdown-basic-button"
                      title={EthNetworkNameMapping[wallet.networkId]}
                      defaultValue={EthNetworks.Goerli}
                      onSelect={changeNetwork}
                      variant={theme.buttons}>
                      {Networks.map((network, i) => (
                        <Dropdown.Item
                          key={i}
                          active={wallet.networkId === network}
                          eventKey={network}>
                          {EthNetworkNameMapping[network]}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </Col>
                </>
              )}
              <Col>
                <ConnectWallet />
              </Col>
            </Row>
          </Container>
        </Navbar>
      </header>
      <Outlet />
      <ToastContainer
        position="bottom-end"
        containerPosition="fixed"
        className="p-3">
        {wallet.errors.map((err, i) => (
          <ErrorToast
            key={err.id}
            title={err.type}
            message={err.message}
            id={err.id}
          />
        ))}
      </ToastContainer>
    </div>
  );
};

const ErrorToast: FC<{ title: string; message: string; id: string }> = ({
  title,
  message,
  id,
}) => {
  const [show, setShow] = useState(true);
  const dispatch = useAppDispatch();

  return (
    <Toast
      bg="danger"
      onClose={() => {
        dispatch(rmError(id));
        setShow(false);
      }}
      show={show}
      delay={5000}
      autohide>
      <Toast.Header>
        <strong className="me-auto">{title}</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};

export default App;
