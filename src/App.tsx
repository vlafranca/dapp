import { EventKey } from "@restart/ui/types";
import React, { useContext } from "react";
import {
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Nav,
  Navbar,
  Row,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Outlet } from "react-router-dom";
import Web3 from "web3";
import "./App.scss";
import ConnectWallet from "./components/ConnectWallet/ConnectWallet";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { updateBalance, updateNetwork } from "./store/walletSlice";
import { EthNetworkNameMapping, EthNetworks } from "./types/web3";
import Web3Context from "./Web3Context";

const Networks = [EthNetworks.MainNet, EthNetworks.Goerli];

const App: React.FC = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();
  const web3 = useContext(Web3Context);

  async function changeNetwork(chainId: EventKey | null) {
    if (!chainId) return;
    try {
      const tx = await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: Web3.utils.toHex(chainId) }],
      });
      dispatch(
        //TODO put in thunk
        updateBalance(
          web3.utils.fromWei(
            await web3.eth.getBalance(wallet.walletAddress as string)
          )
        )
      );
      dispatch(updateNetwork(await web3.eth.getChainId()));
    } catch (e: any) {
      alert(e.message);
      console.log(e);
    }
  }

  return (
    <>
      <header>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="#home">ZDAPP</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <LinkContainer to="/ethereum">
                  <Nav.Link href="#home">Ethereum</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/tokens">
                  <Nav.Link href="#link">Tokens</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/nft">
                  <Nav.Link href="#link">NFT</Nav.Link>
                </LinkContainer>
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
                    >
                      {Networks.map((network, i) => (
                        <Dropdown.Item
                          key={i}
                          active={wallet.networkId === network}
                          eventKey={network}
                        >
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
    </>
  );
};

export default App;