import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Outlet } from "react-router-dom";
import "./App.scss";
import ConnectWallet from "./components/ConnectWallet/ConnectWallet";

const App: React.FC = () => {
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
            <Navbar.Brand className="justify-content-end">
              <ConnectWallet />
            </Navbar.Brand>
          </Container>
        </Navbar>
      </header>
      <Outlet />
    </>
  );
};

export default App;
