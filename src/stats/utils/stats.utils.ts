//import { PromisifyBatchRequest } from 'src/utils/lib/PromiseBatchRequest';
import { getContract } from 'src/utils/lib/web3';
import { getBscPrices } from 'src/utils/bsc_helpers';
import { getParameterCaseInsensitive, tokenType } from 'src/utils/helpers';

import masterApeABI from './masterApeABI.json';
import configuration from 'src/config/configuration';
import { poolBalance } from 'src/pairs/pairs.queries';
import { ERC20_ABI } from './erc20Abi';
import { LP_ABI } from './lpAbi';

// ADDRESS GETTERS
function masterApeContractAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.masterApe;
}

function bananaAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.banana;
}

function bananaBusdAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.bananaBusd;
}

/*
export function getStatsContract() {
  return getContract(masterApeABI, masterApeContractAddress());
}
*/

export async function getReward(): Promise<any> {
  const MasterApeContract = getContract(
    masterApeABI,
    masterApeContractAddress(),
  );
  const rewards =
    (((await MasterApeContract.methods.cakePerBlock().call()) / 1e18) *
      604800) /
    3;

  return rewards;
}

export async function getAllPrices(httpService): Promise<any> {
  const prices = await getBscPrices(httpService);
  return prices;
}

function getBananaPriceWithPoolList(poolList) {
  const pool = poolList.find((pool) => pool.address === bananaBusdAddress());
  return pool.poolToken.q1 / pool.poolToken.q0;
}

export async function getAllStats(httpService): Promise<any> {
  const myAddress = process.env.TEST_ADDRESS;
  const masterApeContract = getContract(
    masterApeABI,
    masterApeContractAddress(),
  );
  const prices = await getBscPrices(httpService);
  const tokens = {};

  const poolCount = parseInt(
    await masterApeContract.methods.poolLength().call(),
    10,
  );
 
  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) => await getBscPoolInfo(masterApeContract, x),
    ),
  );

  // eslint-disable-next-line prefer-spread
  const tokenAddresses = [].concat.apply(
    [],
    poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens),
  );

  await Promise.all(
    tokenAddresses.map(async (address) => {
      tokens[address] = await getBscToken(
        address,
        masterApeContractAddress(),
      );
    }),
  );

  // TODO: update this to use both BNB and BUSD pools for average Banana price
  prices[bananaAddress()] = { usd: getBananaPriceWithPoolList(poolInfos) };

  const poolPrices = {
    pools: [],
    farms: [],
  };

  for (let i = 0; i < poolInfos.length; i++) {
    if (poolInfos[i].poolToken) {
      getPoolPrices(tokens, prices, poolInfos[i].poolToken, poolPrices)
    }
  }
  return poolPrices;
}

function getPoolPrices(tokens, prices, pool, poolPrices) {
  if (pool.token0 != null) {
    poolPrices.farms.push(getLPTokenPrices(tokens, prices, pool));
  } else {
    poolPrices.pools.push(getBep20Prices(prices, pool));
  }
}

async function getBscPoolInfo(masterApeContract, poolIndex) {
  const poolInfo = await masterApeContract.methods.poolInfo(poolIndex).call();
  // Determine if Bep20 or Lp token
  const poolToken =
    poolIndex !== 0
      ? await getBscLpToken(
          poolInfo.lpToken,
          masterApeContractAddress(),
        )
      : await getBscToken(
          poolInfo.lpToken,
          masterApeContractAddress(),
        );
  
  return {
    address: poolInfo.lpToken,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken: poolToken,
    poolIndex: poolIndex,
    lastRewardBlock: poolInfo.lastRewardBlock,
  };
}

async function getBscToken(tokenAddress, stakingAddress) {
  const bep20 = getContract(ERC20_ABI, tokenAddress);
  return await getBep20(bep20, tokenAddress, stakingAddress);
}

async function getBscLpToken(tokenAddress, stakingAddress) {
  const lp = getContract(LP_ABI, tokenAddress);
  return await getBscLp(lp, tokenAddress, stakingAddress);
}

async function getBep20(token, address, stakingAddress) {
  if (address == '0x0000000000000000000000000000000000000000') {
    return {
      address,
      name: 'Binance',
      symbol: 'BNB',
      totalSupply: 1e8,
      decimals: 18,
      staked: 0,
      tokens: [address],
    };
  }
  const decimals = await token.methods.decimals().call();
  return {
    address,
    name: await token.methods.name().call(),
    symbol: await token.methods.symbol().call(),
    totalSupply: await token.methods.totalSupply().call(),
    decimals: decimals,
    staked:
      (await token.methods.balanceOf(stakingAddress).call()) / 10 ** decimals,
    tokens: [address],
  };
}

async function getBscLp(pool, poolAddress, stakingAddress) {
  const reserves = await pool.methods.getReserves().call();
  const q0 = reserves._reserve0;
  const q1 = reserves._reserve1;
  const decimals = await pool.methods.decimals().call();
  const token0 = await pool.methods.token0().call();
  const token1 = await pool.methods.token1().call();
  return {
    lpSymbol: await pool.methods.symbol().call(),
    name: await pool.methods.name().call(),
    address: poolAddress,
    token0,
    q0,
    token1,
    q1,
    totalSupply: (await pool.methods.totalSupply().call()) / 10 ** decimals,
    stakingAddress: stakingAddress,
    staked:
      (await pool.methods.balanceOf(stakingAddress).call()) / 10 ** decimals,
    decimals: decimals,
    tokens: [token0, token1],
    is1inch: false,
  };
}

// Given array of prices and single pool contract, return price and tvl info for pool token
function getLPTokenPrices(tokens, prices, pool) {
  const t0 = getParameterCaseInsensitive(tokens, pool.token0);
  let p0 = getParameterCaseInsensitive(prices, pool.token0)?.usd;
  const t1 = getParameterCaseInsensitive(tokens, pool.token1);
  let p1 = getParameterCaseInsensitive(prices, pool.token1)?.usd;
  if (p0 == null && p1 == null) {
    return undefined;
  }
  const q0 = pool.q0 / 10 ** t0.decimals;
  const q1 = pool.q1 / 10 ** t1.decimals;
  if (p0 == null) {
    p0 = (q1 * p1) / q0;
    prices[pool.token0] = { usd: p0 };
  }
  if (p1 == null) {
    p1 = (q0 * p0) / q1;
    prices[pool.token1] = { usd: p1 };
  }
  const tvl = q0 * p0 + q1 * p1;
  const price = tvl / pool.totalSupply;
  prices[pool.address] = { usd: price };
  const staked_tvl = pool.staked * price;
  let lpSymbol = `[${t0.symbol}]-[${t1.symbol}] LP`;

  return {
    address: pool.address,
    lpSymbol: lpSymbol,
    t0: t0,
    p0: p0,
    q0: q0,
    t1: t1,
    p1: p1,
    q1: q1,
    price: price,
    totalSupply: pool.totalSupply,
    tvl: tvl,
    stakedTvl: staked_tvl,
  };
}

// Given array of prices and single pool contract, return price and tvl info for pool token
function getBep20Prices(prices, pool) {
  const price = getParameterCaseInsensitive(prices, pool.address)?.usd;
  const tvl = (pool.totalSupply * price) / 10 ** pool.decimals;
  const staked_tvl = pool.staked * price;

  return {
    address: pool.address,
    lpSymbol: pool.symbol,
    name: pool.name,
    price: price,
    tvl: tvl,
    stakedTvl: staked_tvl,
  };
}
