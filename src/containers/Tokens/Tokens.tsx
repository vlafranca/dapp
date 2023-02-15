import { Utils } from "alchemy-sdk";
import { FC, useEffect } from "react";
import { Card, Col, Image, Row } from "react-bootstrap";
import { ArrowRepeat } from "react-bootstrap-icons";
import LoadingIndicator from "../../components/Spinner/Spinner";
import ThemeButton from "../../components/ThemeButton/ThemeButton";
import ThemeCard from "../../components/ThemeCard/ThemeCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPrice, fetchTokens } from "../../store/thunk";
import { TokenDetail } from "../../store/walletSlice";

interface TokensProps {}

const Tokens: FC<TokensProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wallet.walletAddress || wallet.tokens.hasData) return;

    refresh();
  }, [wallet.networkId]);

  const refresh = () => dispatch(fetchTokens());

  if (wallet.tokens.loading) return <LoadingIndicator />;

  return (
    <>
      <Row>
        <Col xs="auto">
          <h1>Your tokens</h1>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          (${Math.round(Number(wallet.tokens.totalPrice) * 100) / 100})
        </Col>
        <Col md="auto" xs="12" className="d-flex align-items-center ms-auto">
          <ThemeButton className="d-flex align-items-center" onClick={refresh}>
            <ArrowRepeat />
          </ThemeButton>
        </Col>
      </Row>
      {wallet?.tokens.data?.length ? (
        wallet?.tokens.data?.map((token, i) => (
          <TokenDetailCard key={i} token={token} />
        ))
      ) : (
        <Row className="mt-4">
          <Col className="text-center">No Token recorded</Col>
        </Row>
      )}
    </>
  );
};

const TokenDetailCard: FC<{ token: TokenDetail }> = ({ token }) => {
  const dispatch = useAppDispatch();
  const tokenBalance = Utils.formatEther(token.tokenBalance as string);

  useEffect(() => {
    if (token.price !== undefined) return;

    dispatch(fetchPrice(token));
  }, []);

  return (
    <ThemeCard className="mb-2 image-left">
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
            xs="auto"
            className="d-flex justify-content-end align-items-center text-end">
            <div>
              <p className="mb-0">
                {tokenBalance}({token.symbol})
              </p>
              {token.price ? "$" + token.price * Number(tokenBalance) : "NA"}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </ThemeCard>
  );
};

export default Tokens;
