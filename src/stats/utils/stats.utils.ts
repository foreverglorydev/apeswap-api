import { PromisifyBatchRequest } from 'src/utils/lib/PromiseBatchRequest';
import { getContract } from 'src/utils/lib/web3';

import statsABI from './stats.json';
import configuration from 'src/config/configuration';


function masterChefContractAddress(): string {
  return configuration()[process.env.CHAIN_ID].masterChef.address;
}

export function getStatsContract() {
  return getContract(statsABI, masterChefContractAddress());
}