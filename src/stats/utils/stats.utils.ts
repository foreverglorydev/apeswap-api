import { PromisifyBatchRequest } from 'src/utils/lib/PromiseBatchRequest';
import { getContract } from 'src/utils/lib/web3';

import masterChefABI from './masterChefABI.json';
import configuration from 'src/config/configuration';

function masterChefContractAddress(): string {
  return configuration()[process.env.CHAIN_ID].masterChef.address;
}

export function getStatsContract() {
  return getContract(masterChefABI, masterChefContractAddress());
}

export async function getReward() : Promise<any> {
  const MasterChefContract = getContract(masterChefABI, masterChefContractAddress());
  const rewards = await MasterChefContract.methods.cakePerBlock().call();

  return rewards;
}