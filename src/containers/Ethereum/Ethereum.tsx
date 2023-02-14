import { FC, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Web3 from "web3";
import { useAppSelector } from "../../store/hooks";

interface EthereumProps {}

const Ethereum: FC<EthereumProps> = () => {
  const wallet = useAppSelector((state) => state.wallet);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!wallet.walletAddress) return;
    // TODO put error boundary when no api key double request
    fetch(
      `http://api.etherscan.io/api?module=account&action=txlist&address=${wallet.walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
    )
      .then((data) => data.json())
      .then((data) => {
        setTransactions(data.result);
      });
  }, [wallet.walletAddress]);

  if (!transactions.length) {
    return <div>Spinner</div>;
  }

  return (
    <>
      {transactions.map((transaction: any, i: number) => {
        return (
          <Card className="mb-2" key={i}>
            <Card.Body>{Web3.utils.fromWei(transaction.value)}</Card.Body>
          </Card>
        );
      })}
    </>
  );
};

export default Ethereum;
