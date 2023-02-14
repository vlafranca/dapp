import { FC, useEffect, useState } from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";
import Web3 from "web3";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEthTransactions } from "../../store/thunk";
import { WalletState } from "../../store/walletSlice";

interface EthereumProps {}

const Ethereum: FC<EthereumProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  // const [transactions, setTransactions] = useState([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wallet.walletAddress || wallet.ethereum.hasData) return;

    dispatch(fetchEthTransactions());
  }, []);

  if (wallet?.ethereum?.loading) {
    return <div>Spinner</div>;
  }

  return (
    <>
      <Row>
        <Col xs="auto">
          <h1>Ethereum portfolio</h1>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          ({Math.round(Number(wallet.balance) * 1000000) / 1000000} eth)
        </Col>
      </Row>
      {wallet?.ethereum?.transactions?.map((transaction: any, i: number) => {
        return (
          <TransactionCard
            index={i}
            transaction={transaction}
            wallet={wallet}
          />
        );
      })}
    </>
  );
};

const TransactionCard: FC<{
  index: number;
  transaction: any;
  wallet: WalletState;
}> = ({ index, transaction, wallet }) => {
  const [price, setPrice] = useState<number | null>(null);
  const amount = Web3.utils.fromWei(transaction.value);
  const date = new Date(parseInt(transaction.timeStamp) * 1000);

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/history?date=${date.getDate()}-${
        date.getUTCMonth() + 1
      }-${date.getFullYear()}&localization=false`
    )
      .then((resp) => resp.json())
      .then((data: any) => setPrice(data.market_data.current_price.usd));
  }, []);

  return (
    <Card className="mb-2" key={index}>
      <Card.Body>
        <Row>
          <Col className="d-flex flex-column">
            {transaction.to.toLowerCase() ===
            wallet.walletAddress?.toLowerCase() ? (
              <div>
                <Badge bg="success">IN</Badge>
              </div>
            ) : (
              <div>
                <Badge bg="warning">OUT</Badge>
              </div>
            )}
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Col>
          <Col
            md={3}
            className="ms-auto d-flex justify-content-end align-items-center text-end"
          >
            <div>
              <p className="mb-0">{amount} ETH</p>
              {price && "$" + (price * Number(amount)).toPrecision(4)}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Ethereum;
