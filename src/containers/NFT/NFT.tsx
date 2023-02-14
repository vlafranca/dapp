import { Alchemy, Network, OwnedNft } from "alchemy-sdk";
import { FC, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useAppSelector } from "../../store/hooks";

interface NFTProps {}

const config = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const NFT: FC<NFTProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const [collections, setCollections] = useState<OwnedNft[][]>([]);

  useEffect(() => {
    if (!wallet.walletAddress) return;

    alchemy.nft
      .getNftsForOwner(wallet.walletAddress)
      .then((res) => {
        // setCollections(e);
        console.log(res);
        setCollections(
          Object.values(
            res.ownedNfts.reduce<{ [key: string]: OwnedNft[] }>((acc, nft) => {
              if (!acc[nft.contract.address]) acc[nft.contract.address] = [];

              acc[nft.contract.address].push(nft);
              return acc;
            }, {})
          )
        );
      })
      .catch(alert);
  }, []);

  if (!collections.length) return <div>Spinner</div>;

  return (
    <>
      {collections.map((collection) => {
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
