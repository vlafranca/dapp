import {
  Alchemy,
  Network,
  TokenBalance,
  TokenMetadataResponse,
  Utils,
} from "alchemy-sdk";
import { FC, useEffect, useState } from "react";
import { Card, Col, Image, Row } from "react-bootstrap";
import { useAppSelector } from "../../store/hooks";

interface TokensProps {}

const config = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const Tokens: FC<TokensProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  useEffect(() => {
    if (!wallet.walletAddress) return;

    alchemy.core
      .getTokenBalances(wallet.walletAddress)
      .then((e) => {
        setTokens(e.tokenBalances);
      })
      .catch(alert);
  }, []);

  if (!tokens.length) return <div>Spinner</div>;

  return (
    <>
      {tokens.map((token, i) => (
        <TokenDetail key={i} token={token} />
      ))}
    </>
  );
};

const TokenDetail: FC<{ token: TokenBalance }> = ({ token }) => {
  const [metaData, setMetaData] = useState<TokenMetadataResponse | undefined>(
    undefined
  );
  const [price, setPrice] = useState<number | null>(null);
  const tokenBalance = Utils.formatEther(token.tokenBalance as string);

  useEffect(() => {
    alchemy.core
      .getTokenMetadata(token.contractAddress)
      .then((resp) => {
        setMetaData(resp);
      })
      .catch(alert);

    //TODO get coin prices all at once
    fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.contractAddress}&vs_currencies=USD`
    )
      .then((resp) => resp.json())
      .then(
        (price: {
          [key: string]: {
            usd: number;
          };
        }) =>
          price[token.contractAddress] &&
          setPrice(price[token.contractAddress].usd)
      );
  }, []);

  if (!metaData) return <div>Spinner</div>;

  return (
    <Card className="mb-2">
      <Card.Body>
        <Row>
          <Col xs={"auto"}>
            {metaData.logo && <Image src={metaData.logo} rounded={true} />}
          </Col>
          <Col className="d-flex align-items-center">
            {metaData.name} {metaData.symbol}
          </Col>
          <Col
            md={3}
            className="ms-auto d-flex justify-content-center align-items-center text-center">
            <div>
              <p className="mb-0">
                {tokenBalance}({metaData.symbol})
              </p>
              {price && "$" + price * Number(tokenBalance)}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Tokens;
