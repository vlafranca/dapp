import { FC, useContext, useEffect } from "react";
import { Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { ArrowRepeat } from "react-bootstrap-icons";
import Web3 from "web3";
import LoadingIndicator from "../../components/Spinner/Spinner";
import ThemeButton from "../../components/ThemeButton/ThemeButton";
import ThemeCard from "../../components/ThemeCard/ThemeCard";
import ThemeContext from "../../contexts/ThemeContext";
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

  const refresh = () => dispatch(fetchEthTransactions(1));

  if (wallet?.ethereum?.loading) {
    return <LoadingIndicator />;
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
          <ThemeButton className="d-flex align-items-center" onClick={refresh}>
            <ArrowRepeat />
          </ThemeButton>
        </Col>
      </Row>
      {wallet?.ethereum.transactions?.length ? (
        <>
          {wallet.ethereum.transactions.map((transaction: any, i: number) => {
            return (
              <TransactionCard
                key={i}
                transaction={transaction}
                wallet={wallet}
              />
            );
          })}

          {!(wallet?.ethereum.transactions?.length % 10) && (
            <Row>
              <Col className="text-center">
                {wallet.ethereum.loadingMore ? (
                  <Spinner />
                ) : (
                  <Button
                    onClick={() =>
                      dispatch(fetchEthTransactions(wallet.ethereum.page + 1))
                    }
                  >
                    Load more
                  </Button>
                )}
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Row className="mt-4">
          <Col className="text-center">No transactions recorded</Col>
        </Row>
      )}
    </>
  );
};

const TransactionCard: FC<{
  transaction: any;
  wallet: WalletState;
}> = ({ transaction, wallet }) => {
  const amount = Web3.utils.fromWei(transaction.value);
  const date = new Date(parseInt(transaction.timeStamp) * 1000);
  const dispatch = useAppDispatch();
  const [theme] = useContext(ThemeContext);

  useEffect(() => {
    if (transaction.price !== undefined) return;

    dispatch(fetchHistoricalPrice(transaction));
  }, []);

  return (
    <ThemeCard className={"mb-2"}>
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
            xs="auto"
            className="d-flex justify-content-end align-items-center text-end"
          >
            <div>
              <p className="mb-0">{amount} ETH</p>
              {transaction.price &&
                "$" + (transaction.price * Number(amount)).toPrecision(4)}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </ThemeCard>
  );
};

export default Ethereum;
