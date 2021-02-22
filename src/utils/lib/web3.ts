import Web3 from 'web3';
import { BSC_NODE_RPC } from '../constants';

export const getWeb3 = (): Web3 => {
  const provider: string =
    BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC.length)];

  return new Web3(
    new Web3.providers.HttpProvider(provider, { timeout: 30000 }),
  );
};

export const getContract = (abi: any, address: string) => {
  const web3: Web3 = getWeb3();
  return new web3.eth.Contract(abi, address);
};
