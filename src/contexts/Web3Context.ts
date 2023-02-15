import React from "react";
import Web3 from "web3";

const Web3Context = React.createContext<Web3>(new Web3(Web3.givenProvider));

export const Web3Provider = Web3Context.Provider;
export default Web3Context;
