import { FC, useEffect } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Spinner from "../../components/Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchNFTs } from "../../store/thunk";

interface NFTProps {}

const NFT: FC<NFTProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wallet.walletAddress || wallet.nfts.hasData) return;

    dispatch(fetchNFTs());
  }, []);

  if (wallet.nfts.loading) return <Spinner />;

  return (
    <>
      {wallet.nfts.data?.map((collection) => {
        return (
          <>
            <h3>{collection[0].contract.name}</h3>
            <Row className="mb-3">
              {collection.map((nft) => {
                return (
                  <Col md={3} className="mb-3" key={nft.tokenId}>
                    <Card>
                      <Card.Img variant="top" src={nft.media[0]?.gateway} />
                      <Card.Body>
                        <Card.Title>{nft.title}</Card.Title>
                      </Card.Body>
                    </Card>
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
