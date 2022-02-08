import { getContract } from 'src/utils/lib/web3';
import {
  getParameterCaseInsensitive,
  createLpPairName,
} from 'src/utils/helpers';

import { MASTER_APE_ABI } from './abi/masterApeAbi';
import configuration from 'src/config/configuration';
import { BEP20_REWARD_APE_ABI } from './abi/bep20RewardApeAbi';

// ADDRESS GETTERS
export function masterApeContractAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.masterApe;
}

export function bananaAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.banana;
}

export function goldenBananaAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.goldenBanana;
}

export function gBananaTreasury(): string {
  return configuration()[process.env.CHAIN_ID].contracts.gBananaTreasury;
}

function bnbAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.bnb;
}

function bananaBusdAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.bananaBusd;
}

function bananaBnbAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.bananaBnb;
}

export function burnAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.burn;
}

export function apePriceGetter(): string {
  return configuration()[process.env.CHAIN_ID].apePriceGetter;
}

export function masterApeContractWeb(): any {
  return getContract(MASTER_APE_ABI, masterApeContractAddress());
}

export function getBananaPriceWithPoolList(poolList, prices) {
  const poolBusd = poolList.find(
    (pool) => pool.address === bananaBusdAddress(),
  );
  const bananaPriceUsingBusd = poolBusd.poolToken.q1 / poolBusd.poolToken.q0;
  if (prices[bnbAddress()]) {
    const poolBnb = poolList.find(
      (pool) => pool.address === bananaBnbAddress(),
    );
    const bnbTvl =
      (poolBnb.poolToken.q1 * prices[bnbAddress()].usd) /
      10 ** poolBnb.poolToken.decimals;
    const busdTvl = poolBusd.poolToken.q1 / 10 ** poolBusd.poolToken.decimals;
    const bananaPriceUsingBnb =
      (poolBnb.poolToken.q1 * prices[bnbAddress()].usd) / poolBnb.poolToken.q0;

    return (
      (bananaPriceUsingBnb * bnbTvl + bananaPriceUsingBusd * busdTvl) /
      (bnbTvl + busdTvl)
    );
  }

  return bananaPriceUsingBusd;
}

export function getPoolPrices(
  tokens,
  prices,
  pool,
  poolPrices,
  poolIndex,
  allocPoints,
  totalAllocPoints,
  rewardsPerDay,
) {
  if (pool.token0 != null) {
    poolPrices.farms.push({
      ...{ poolIndex: poolIndex },
      ...getFarmLPTokenPrices(
        tokens,
        prices,
        pool,
        allocPoints,
        totalAllocPoints,
        rewardsPerDay,
      ),
    });
  } else {
    poolPrices.pools.push({
      ...{ poolIndex: poolIndex },
      ...getBep20Prices(
        prices,
        pool,
        allocPoints,
        totalAllocPoints,
        rewardsPerDay,
      ),
    });
  }
}

// Given array of prices and single farm contract, return price and tvl info for farm
function getFarmLPTokenPrices(
  tokens,
  prices,
  pool,
  allocPoints,
  totalAllocPoints,
  rewardsPerDay,
) {
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
  const stakedTvl = pool.staked * price;

  // APR calculations
  const poolRewardsPerDay = (allocPoints / totalAllocPoints) * rewardsPerDay;
  const apr =
    ((poolRewardsPerDay * prices[bananaAddress()].usd) / stakedTvl) * 365;

  return {
    address: pool.address,
    name: createLpPairName(t0.symbol, t1.symbol),
    t0Address: t0.address,
    t0Symbol: t0.symbol,
    t0Decimals: t0.decimals,
    p0,
    q0,
    t1Address: t1.address,
    t1Symbol: t1.symbol,
    t1Decimals: t1.decimals,
    p1,
    q1,
    price,
    totalSupply: pool.totalSupply,
    tvl,
    stakedTvl,
    apr,
    rewardTokenPrice: getParameterCaseInsensitive(prices, bananaAddress())?.usd,
    rewardTokenSymbol: 'BANANA',
    decimals: pool.decimals,
  };
}

// Given array of prices and single pool contract, return price and tvl info for pool
function getBep20Prices(
  prices,
  pool,
  allocPoints,
  totalAllocPoints,
  rewardsPerDay,
) {
  const price = getParameterCaseInsensitive(prices, pool.address)?.usd || 0;
  const tvl = (pool.totalSupply * price) / 10 ** pool.decimals;
  const stakedTvl = pool.staked * price;

  // APR calculations
  const poolRewardsPerDay = (allocPoints / totalAllocPoints) * rewardsPerDay;
  const apr =
    ((poolRewardsPerDay * prices[bananaAddress()].usd) / stakedTvl) * 365;

  return {
    address: pool.address,
    lpSymbol: pool.symbol,
    price,
    tvl,
    stakedTvl,
    staked: pool.staked,
    apr,
    rewardTokenPrice: getParameterCaseInsensitive(prices, bananaAddress())?.usd,
    rewardTokenSymbol: 'BANANA',
    decimals: pool.decimals,
  };
}

// Get TVL info for Pools only given a wallet
export async function getWalletStatsForPools(
  wallet,
  pools,
  masterApeContract,
): Promise<any> {
  const allPools = [];
  await Promise.all(
    pools.map(async (pool) => {
      const userInfo = await masterApeContract.methods
        .userInfo(pool.poolIndex, wallet)
        .call();
      const pendingReward =
        (await masterApeContract.methods
          .pendingCake(pool.poolIndex, wallet)
          .call()) /
        10 ** pool.decimals;

      if (userInfo.amount != 0 || pendingReward != 0) {
        const stakedTvl = (userInfo.amount * pool.price) / 10 ** pool.decimals;
        const dollarsEarnedPerDay = (stakedTvl * pool.apr) / 365;
        const tokensEarnedPerDay = dollarsEarnedPerDay / pool.rewardTokenPrice;
        const curr_pool = {
          address: pool.address,
          name: pool.lpSymbol,
          rewardTokenSymbol: pool.rewardTokenSymbol,
          stakedTvl,
          pendingReward,
          pendingRewardUsd: pendingReward * pool.rewardTokenPrice,
          apr: pool.apr,
          dollarsEarnedPerDay,
          dollarsEarnedPerWeek: dollarsEarnedPerDay * 7,
          dollarsEarnedPerMonth: dollarsEarnedPerDay * 30,
          dollarsEarnedPerYear: dollarsEarnedPerDay * 365,
          tokensEarnedPerDay,
          tokensEarnedPerWeek: tokensEarnedPerDay * 7,
          tokensEarnedPerMonth: tokensEarnedPerDay * 30,
          tokensEarnedPerYear: tokensEarnedPerDay * 365,
        };

        allPools.push(curr_pool);
      }
    }),
  );
  return allPools;
}

// Get TVL info for Farms only given a wallet
export async function getWalletStatsForFarms(
  wallet,
  farms,
  masterApeContract,
): Promise<any> {
  const allFarms = [];
  await Promise.all(
    farms.map(async (farm) => {
      const userInfo = await masterApeContract.methods
        .userInfo(farm.poolIndex, wallet)
        .call();
      const pendingReward =
        (await masterApeContract.methods
          .pendingCake(farm.poolIndex, wallet)
          .call()) /
        10 ** farm.decimals;

      if (userInfo.amount != 0 || pendingReward != 0) {
        const stakedTvl = (userInfo.amount * farm.price) / 10 ** farm.decimals;
        const dollarsEarnedPerDay = (stakedTvl * farm.apr) / 365;
        const tokensEarnedPerDay = dollarsEarnedPerDay / farm.rewardTokenPrice;
        const curr_farm = {
          address: farm.address,
          name: farm.name,
          stakedTvl,
          pendingReward,
          pendingRewardUsd: pendingReward * farm.rewardTokenPrice,
          apr: farm.apr,
          dollarsEarnedPerDay,
          dollarsEarnedPerWeek: dollarsEarnedPerDay * 7,
          dollarsEarnedPerMonth: dollarsEarnedPerDay * 30,
          dollarsEarnedPerYear: dollarsEarnedPerDay * 365,
          tokensEarnedPerDay,
          tokensEarnedPerWeek: tokensEarnedPerDay * 7,
          tokensEarnedPerMonth: tokensEarnedPerDay * 30,
          tokensEarnedPerYear: tokensEarnedPerDay * 365,
        };

        allFarms.push(curr_farm);
      }
    }),
  );
  return allFarms;
}

// Get TVL info for IncentivizedPools only given a wallet
export async function getWalletStatsForIncentivizedPools(
  wallet,
  pools,
): Promise<any> {
  const allIncentivizedPools = [];
  await Promise.all(
    pools.map(async (incentivizedPool) => {
      const contract = getContract(
        BEP20_REWARD_APE_ABI,
        incentivizedPool.address,
      );
      const userInfo = await contract.methods.userInfo(wallet).call();
      const pendingReward =
        (await contract.methods.pendingReward(wallet).call()) /
        10 ** incentivizedPool.rewardDecimals;

      if (userInfo.amount != 0 || pendingReward != 0) {
        const stakedTvl =
          (userInfo.amount * incentivizedPool.price) /
          10 ** incentivizedPool.stakedTokenDecimals;
        const dollarsEarnedPerDay = (stakedTvl * incentivizedPool.apr) / 365;
        const tokensEarnedPerDay =
          dollarsEarnedPerDay / incentivizedPool.rewardTokenPrice;
        const curr_pool = {
          id: incentivizedPool.sousId,
          address: incentivizedPool.address,
          name: incentivizedPool.name,
          rewardTokenSymbol: incentivizedPool.rewardTokenSymbol,
          stakedTvl,
          pendingReward,
          pendingRewardUsd: pendingReward * incentivizedPool.rewardTokenPrice,
          apr: incentivizedPool.apr,
          dollarsEarnedPerDay,
          dollarsEarnedPerWeek: dollarsEarnedPerDay * 7,
          dollarsEarnedPerMonth: dollarsEarnedPerDay * 30,
          dollarsEarnedPerYear: dollarsEarnedPerDay * 365,
          tokensEarnedPerDay,
          tokensEarnedPerWeek: tokensEarnedPerDay * 7,
          tokensEarnedPerMonth: tokensEarnedPerDay * 30,
          tokensEarnedPerYear: tokensEarnedPerDay * 365,
        };

        allIncentivizedPools.push(curr_pool);
      }
    }),
  );
  return allIncentivizedPools;
}
