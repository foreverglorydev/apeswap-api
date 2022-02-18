import configuration from 'src/config/configuration';
import Web3 from 'web3';

const web3 = {};
function getNodes(chainId: number): string {
  return configuration()[chainId].appNodes;
}

function getRandomNode(chainId: number) {
  const BSC_NODE_RPC = getNodes(chainId);
  return BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC.length)];
}

function getRandomWeb3(chainId: number) {
  const provider: string = getRandomNode(chainId);
  if (!web3[provider]) {
    web3[provider] = new Web3(
      new Web3.providers.HttpProvider(provider, { timeout: 30000 }),
    );
    console.log(`Initialized web3 provider: ${provider}`);
  }
  return web3[provider];
}

export const getWeb3 = (chainId = +process.env.CHAIN_ID): Web3 => {
  return getRandomWeb3(chainId);
  /* if (!web3) {
    const BSC_NODE_RPC = getNodes();
    const provider: string =
      BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC.length)];

    web3 = new Web3(
      new Web3.providers.HttpProvider(provider, { timeout: 30000 }),
    );
  }
  return web3; */
};

export const getContract = (abi: any, address: string) => {
  const web3: Web3 = getRandomWeb3(+process.env.CHAIN_ID);
  return new web3.eth.Contract(abi, address);
};

export const getContractNetwork = (
  abi: any,
  address: string,
  chainId: number,
) => {
  const web3: Web3 = getRandomWeb3(chainId);
  return new web3.eth.Contract(abi, address);
};

export const isTransactionMined = async (transactionHash) => {
  try {
    const txReceipt = await getWeb3().eth.getTransactionReceipt(
      transactionHash,
    );
    if (txReceipt && txReceipt.blockNumber) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const getCurrentBlock = async () => {
  return await getRandomWeb3(+process.env.CHAIN_ID).eth.getBlockNumber();
};
