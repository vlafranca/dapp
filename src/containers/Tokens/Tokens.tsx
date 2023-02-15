import { Utils } from "alchemy-sdk";
import { FC, useEffect } from "react";
import { Card, Col, Image, Row } from "react-bootstrap";
import Spinner from "../../components/Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPrice, fetchTokens } from "../../store/thunk";
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
  const dispatch = useAppDispatch();
  const tokenBalance = Utils.formatEther(token.tokenBalance as string);

  useEffect(() => {
    dispatch(fetchPrice(token));
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
              {token.price && "$" + token.price * Number(tokenBalance)}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Tokens;
