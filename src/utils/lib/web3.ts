import configuration from 'src/config/configuration';
import Web3 from 'web3';

const web3 = {};
function getNodes(): string {
  return configuration()[process.env.CHAIN_ID].appNodes;
}

function getRandomNode() {
  const BSC_NODE_RPC = getNodes();
  return BSC_NODE_RPC[Math.floor(Math.random() * BSC_NODE_RPC.length)];
}

function getRandomWeb3() {
  const provider: string = getRandomNode();
  if (!web3[provider]) {
    web3[provider] = new Web3(
      new Web3.providers.HttpProvider(provider, { timeout: 30000 }),
    );
    console.log(`Initialized web3 provider: ${provider}`);
  }
  return web3[provider];
}

export const getWeb3 = (): Web3 => {
  return getRandomWeb3();
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
  const web3: Web3 = getRandomWeb3();
  return new web3.eth.Contract(abi, address);
};

export const getCurrentBlock = async () => {
  return await getRandomWeb3().eth.getBlockNumber();
};
