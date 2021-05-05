import { AbiItem } from 'web3-utils';
import { Interface } from '@ethersproject/abi';
import { getWeb3 } from './web3';
import MultiCallAbi from './abi/Multicall.json';
import configuration from 'src/config/configuration';

interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (exemple: balanceOf)
  params?: any[]; // Function params
}

export const multicall = async (abi: any[], calls: Call[]) => {
  //console.log(getMulticallAddress());
  //console.log(calls[0]);
  const web3 = getWeb3();
  const multi = new web3.eth.Contract(
    (MultiCallAbi as unknown) as AbiItem,
    getMulticallAddress(),
  );
  const itf = new Interface(abi);

  const calldata = calls.map((call) => [
    call.address.toLowerCase(),
    itf.encodeFunctionData(call.name, call.params),
  ]);
  const { returnData } = await multi.methods.aggregate(calldata).call();
  const res = returnData.map((call, i) =>
    itf.decodeFunctionResult(calls[i].name, call),
  );
  return res;
};

const getMulticallAddress = () => {
  return configuration()[process.env.CHAIN_ID].contracts.mulltiCall;
};
