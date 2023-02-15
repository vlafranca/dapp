import { FC, useEffect } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { ArrowRepeat } from "react-bootstrap-icons";
import LoadingIndicator from "../../components/Spinner/Spinner";
import ThemeButton from "../../components/ThemeButton/ThemeButton";
import ThemeCard from "../../components/ThemeCard/ThemeCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNFTs } from "../../store/thunk";

interface NFTProps {}

const NFT: FC<NFTProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wallet.walletAddress || wallet.nfts.hasData) return;

    refresh();
  }, []);

  const refresh = () => dispatch(fetchNFTs());

  if (wallet.nfts.loading) return <LoadingIndicator />;

  return (
    <>
      <Row>
        <Col xs="auto">
          <h1>Your NFTs</h1>
        </Col>
        <Col md="auto" xs="12" className="d-flex align-items-center ms-auto">
          <ThemeButton className="d-flex align-items-center" onClick={refresh}>
            <ArrowRepeat />
          </ThemeButton>
        </Col>
      </Row>
      {!wallet.nfts.data?.length && (
        <Row className="mt-4">
          <Col className="text-center">No NFT yet</Col>
        </Row>
      )}
      {wallet.nfts.data?.map((collection) => {
        return (
          <>
            <h3>{collection[0].contract.name}</h3>
            <Row className="mb-3">
              {collection.map((nft) => {
                return (
                  <Col md={3} className="mb-3" key={nft.tokenId}>
                    <ThemeCard>
                      <Card.Img variant="top" src={nft.media[0]?.gateway} />
                      <Card.Body>
                        <Card.Title>{nft.title}</Card.Title>
                      </Card.Body>
                    </ThemeCard>
                  </Col>
                );
              })}
            </Row>
          </>
        );
      })}
    </>
  );
};

export default NFT;
