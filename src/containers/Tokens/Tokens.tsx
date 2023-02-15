import { FC, useEffect, useState } from "react";
import { Card, Col, Image, Row } from "react-bootstrap";
import Spinner from "../../components/Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTokens } from "../../store/thunk";
import { TokenDetail } from "../../store/walletSlice";

interface TokensProps {}

const Tokens: FC<TokensProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wallet.walletAddress || wallet.tokens.hasData) return;

    dispatch(fetchTokens());
  }, []);

  if (wallet.tokens.loading) return <Spinner />;

  return (
    <>
      {wallet?.tokens.data?.map((token, i) => (
        <TokenDetailCard key={i} token={token} />
      ))}
    </>
  );
};

const TokenDetailCard: FC<{ token: TokenDetail }> = ({ token }) => {
  const [price, setPrice] = useState<number | null>(null);
  const tokenBalance = 0; //Utils.formatEther(token.tokenBalance as string);

  useEffect(() => {
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

  return (
    <Card className="mb-2 image-left">
      <Card.Body>
        <Row>
          <Col xs={"auto"}>
            {token.logo && (
              <Image src={token.logo} roundedCircle={true} fluid={true} />
            )}
          </Col>
          <Col className="d-flex align-items-center">
            {token.name} {token.symbol}
          </Col>
          <Col
            md={3}
            className="ms-auto d-flex justify-content-center align-items-center text-center">
            <div>
              <p className="mb-0">
                {tokenBalance}({token.symbol})
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
