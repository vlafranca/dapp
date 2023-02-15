import { FC, useEffect } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { ArrowRepeat } from "react-bootstrap-icons";
import Web3 from "web3";
import Spinner from "../../components/Spinner/Spinner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEthTransactions, fetchHistoricalPrice } from "../../store/thunk";
import { WalletState } from "../../store/walletSlice";

interface EthereumProps {}

const Ethereum: FC<EthereumProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  // const [transactions, setTransactions] = useState([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!wallet.walletAddress || wallet.ethereum.hasData) return;

    refresh();
  }, []);

  const refresh = () => dispatch(fetchEthTransactions());

  if (wallet?.ethereum?.loading) {
    return <Spinner />;
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
        <Col md="auto" xs="12" className="d-flex align-items-center ms-auto">
          <Button className="d-flex align-items-center" onClick={refresh}>
            <ArrowRepeat />
          </Button>
        </Col>
      </Row>
      {wallet?.ethereum?.transactions &&
        wallet.ethereum.transactions.map((transaction: any, i: number) => {
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
  const amount = Web3.utils.fromWei(transaction.value);
  const date = new Date(parseInt(transaction.timeStamp) * 1000);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (transaction.price !== undefined) return;

    dispatch(fetchHistoricalPrice(transaction));
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
            className="ms-auto d-flex justify-content-end align-items-center text-end">
            <div>
              <p className="mb-0">{amount} ETH</p>
              {transaction.price &&
                "$" + (transaction.price * Number(amount)).toPrecision(4)}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Ethereum;
