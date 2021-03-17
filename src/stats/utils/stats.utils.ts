import { getContract, getCurrentBlock } from 'src/utils/lib/web3';
import { getBscPrices } from 'src/utils/bsc_helpers';
import {
  getParameterCaseInsensitive,
  incentivizedPools,
} from 'src/utils/helpers';

import { MASTER_APE_ABI } from './abi/masterApeAbi';
import configuration from 'src/config/configuration';
import { ERC20_ABI } from './abi/erc20Abi';
import { LP_ABI } from './abi/lpAbi';

// ADDRESS GETTERS
function masterApeContractAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.masterApe;
}

function bananaAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.banana;
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

function burnAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.burn;
}

export async function getBananaRewardsPerDay(): Promise<any> {
  const MasterApeContract = getContract(
    MASTER_APE_ABI,
    masterApeContractAddress(),
  );
  return (
    (((await MasterApeContract.methods.cakePerBlock().call()) / 1e18) * 86400) /
    3
  );
}

export async function getAllPrices(httpService): Promise<any> {
  const prices = await getBscPrices(httpService);
  return prices;
}

function getBananaPriceWithPoolList(poolList, prices) {
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

export async function getAllStats(httpService): Promise<any> {
  const stats = await getAllStatsFull(httpService);
  stats.incentivizedPools.forEach((pool) => {
    delete pool.abi;
  });

  return stats;
}

export async function getAllStatsFull(httpService): Promise<any> {
  const masterApeContract = getContract(
    MASTER_APE_ABI,
    masterApeContractAddress(),
  );
  const bananaContract = getContract(ERC20_ABI, bananaAddress());
  const prices = await getBscPrices(httpService);
  const tokens = {};
  const totalAllocPoints = await masterApeContract.methods
    .totalAllocPoint()
    .call();
  const rewardsPerDay = await getBananaRewardsPerDay();
  const poolCount = parseInt(
    await masterApeContract.methods.poolLength().call(),
    10,
  );

  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) => await getPoolInfo(masterApeContract, x),
    ),
  );

  // eslint-disable-next-line prefer-spread
  const tokenAddresses = [].concat.apply(
    [],
    poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens),
  );

  await Promise.all(
    tokenAddresses.map(async (address) => {
      tokens[address] = await getTokenInfo(address, masterApeContractAddress());
    }),
  );

  // If Banana price not returned from Gecko, calculating using pools
  if (!prices[bananaAddress()]) {
    prices[bananaAddress()] = {
      usd: getBananaPriceWithPoolList(poolInfos, prices),
    };
  }

  const burntAmount = await getTokenBalanceOfAddress(
    bananaContract,
    burnAddress(),
  );
  const totalSupply = (await getTotalTokenSupply(bananaContract)) - burntAmount;
  const poolPrices = {
    bananaPrice: prices[bananaAddress()].usd,
    tvl: 0,
    tvlInBnb: 0,
    totalVolume: 0,
    burntAmount,
    totalSupply,
    marketCap: totalSupply * prices[bananaAddress()].usd,
    pools: [],
    farms: [],
    incentivizedPools: [],
  };

  for (let i = 0; i < poolInfos.length; i++) {
    if (poolInfos[i].poolToken) {
      getPoolPrices(
        tokens,
        prices,
        poolInfos[i].poolToken,
        poolPrices,
        i,
        poolInfos[i].allocPoints,
        totalAllocPoints,
        rewardsPerDay,
      );
    }
  }

  const currentBlockNumber = await getCurrentBlock();

  poolPrices.incentivizedPools = await Promise.all(
    incentivizedPools.map(
      async (pool) =>
        await getIncentivizedPoolInfo(pool, prices, currentBlockNumber),
    ),
  );
  poolPrices.incentivizedPools = poolPrices.incentivizedPools.filter((x) => x); //filter null pools

  return poolPrices;
}

function getPoolPrices(
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
    poolPrices.farms.push(
      getFarmLPTokenPrices(
        tokens,
        prices,
        pool,
        poolIndex,
        allocPoints,
        totalAllocPoints,
        rewardsPerDay,
      ),
    );
  } else {
    poolPrices.pools.push(
      getBep20Prices(
        prices,
        pool,
        poolIndex,
        allocPoints,
        totalAllocPoints,
        rewardsPerDay,
      ),
    );
  }
}

async function getPoolInfo(masterApeContract, poolIndex) {
  const poolInfo = await masterApeContract.methods.poolInfo(poolIndex).call();
  // Determine if Bep20 or Lp token
  const poolToken =
    poolIndex !== 0
      ? await getLpInfo(poolInfo.lpToken, masterApeContractAddress())
      : await getTokenInfo(poolInfo.lpToken, masterApeContractAddress());

  return {
    address: poolInfo.lpToken,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken,
    poolIndex,
    lastRewardBlock: poolInfo.lastRewardBlock,
  };
}

async function getTokenInfo(tokenAddress, stakingAddress) {
  if (tokenAddress == '0x0000000000000000000000000000000000000000') {
    return {
      address: tokenAddress,
      name: 'Binance',
      symbol: 'BNB',
      totalSupply: 1e8,
      decimals: 18,
      staked: 0,
      tokens: [tokenAddress],
    };
  }

  const contract = getContract(ERC20_ABI, tokenAddress);
  const decimals = await contract.methods.decimals().call();

  return {
    address: tokenAddress,
    name: await contract.methods.name().call(),
    symbol: await contract.methods.symbol().call(),
    totalSupply: await contract.methods.totalSupply().call(),
    decimals,
    staked:
      (await contract.methods.balanceOf(stakingAddress).call()) /
      10 ** decimals,
    tokens: [tokenAddress],
  };
}

async function getLpInfo(tokenAddress, stakingAddress) {
  const contract = getContract(LP_ABI, tokenAddress);
  const reserves = await contract.methods.getReserves().call();
  const q0 = reserves._reserve0;
  const q1 = reserves._reserve1;
  const decimals = await contract.methods.decimals().call();
  const token0 = await contract.methods.token0().call();
  const token1 = await contract.methods.token1().call();
  return {
    lpSymbol: await contract.methods.symbol().call(),
    name: await contract.methods.name().call(),
    address: tokenAddress,
    token0,
    q0,
    token1,
    q1,
    totalSupply: (await contract.methods.totalSupply().call()) / 10 ** decimals,
    stakingAddress,
    staked:
      (await contract.methods.balanceOf(stakingAddress).call()) /
      10 ** decimals,
    decimals,
    tokens: [token0, token1],
  };
}

async function getIncentivizedPoolInfo(pool, prices, currentBlockNumber) {
  if (
    pool.startBlock > currentBlockNumber ||
    pool.endBlock < currentBlockNumber
  ) {
    return null;
  }
  const poolContract = getContract(pool.abi, pool.address);

  if (pool.stakeTokenIsLp) {
    const stakedTokenContract = getContract(LP_ABI, pool.stakeToken);
    const reserves = await stakedTokenContract.methods.getReserves().call();
    const stakedTokenDecimals = await stakedTokenContract.methods
      .decimals()
      .call();
    const t0Address = await stakedTokenContract.methods.token0().call();
    const t1Address = await stakedTokenContract.methods.token1().call();

    const token0Contract = getContract(ERC20_ABI, t0Address);
    const token1Contract = getContract(ERC20_ABI, t1Address);
    const token0decimals = await token0Contract.methods.decimals().call();
    const token1decimals = await token1Contract.methods.decimals().call();

    const q0 = reserves._reserve0 / 10 ** token0decimals;
    const q1 = reserves._reserve1 / 10 ** token1decimals;

    let p0 = getParameterCaseInsensitive(prices, t0Address)?.usd;
    let p1 = getParameterCaseInsensitive(prices, t1Address)?.usd;

    if (p0 == null && p1 == null) {
      return undefined;
    }
    if (p0 == null) {
      p0 = (q1 * p1) / q0;
      prices[t0Address] = { usd: p0 };
    }
    if (p1 == null) {
      p1 = (q0 * p0) / q1;
      prices[t1Address] = { usd: p1 };
    }

    const tvl = q0 * p0 + q1 * p1;
    const totalSupply =
      (await stakedTokenContract.methods.totalSupply().call()) /
      10 ** stakedTokenDecimals;
    const stakedSupply =
      (await stakedTokenContract.methods.balanceOf(pool.address).call()) /
      10 ** stakedTokenDecimals;
    const stakedTvl = (stakedSupply * tvl) / totalSupply;

    const rewardTokenContract = getContract(ERC20_ABI, pool.rewardToken);
    const rewardDecimals = await rewardTokenContract.methods.decimals().call();
    const rewardsPerBlock =
      (await poolContract.methods.rewardPerBlock().call()) /
      10 ** rewardDecimals;
    const rewardTokenSymbol = await rewardTokenContract.methods.symbol().call();

    const rewardTokenPrice = getParameterCaseInsensitive(
      prices,
      pool.rewardToken,
    )?.usd;
    const apr =
      (rewardTokenPrice * ((rewardsPerBlock * 86400) / 3) * 365) / stakedTvl;

    const t0Symbol = await token0Contract.methods.symbol().call();
    const t1Symbol = await token1Contract.methods.symbol().call();
    const lpSymbol = `[${t0Symbol}]-[${t1Symbol}] LP`;

    return {
      name: pool.name,
      address: pool.address,
      stakedTokenAddress: pool.stakeToken,
      stakedTokenSymbol: lpSymbol,
      t0Address,
      t0Symbol,
      p0,
      q0,
      t1Address,
      t1Symbol,
      p1,
      q1,
      totalSupply,
      stakedSupply,
      rewardDecimals,
      stakedTokenDecimals,
      tvl,
      stakedTvl,
      apr,
      rewardTokenPrice,
      rewardTokenSymbol,
      price: tvl / totalSupply,
      abi: pool.abi,
    };
  } else {
    const rewardContract = getContract(ERC20_ABI, pool.stakeToken);
    // TODO: add code for non-lp token staking
    return null;
  }
}

// Given array of prices and single farm contract, return price and tvl info for farm
function getFarmLPTokenPrices(
  tokens,
  prices,
  pool,
  poolIndex,
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
  const lpSymbol = `[${t0.symbol}]-[${t1.symbol}] LP`;

  // APR calculations
  const poolRewardsPerDay = (allocPoints / totalAllocPoints) * rewardsPerDay;
  const apr =
    ((poolRewardsPerDay * prices[bananaAddress()].usd) / stakedTvl) * 365;

  return {
    address: pool.address,
    lpSymbol,
    poolIndex,
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
    decimals: pool.decimals,
  };
}

// Given array of prices and single pool contract, return price and tvl info for pool
function getBep20Prices(
  prices,
  pool,
  poolIndex,
  allocPoints,
  totalAllocPoints,
  rewardsPerDay,
) {
  const price = getParameterCaseInsensitive(prices, pool.address)?.usd;
  const tvl = (pool.totalSupply * price) / 10 ** pool.decimals;
  const stakedTvl = pool.staked * price;

  // APR calculations
  const poolRewardsPerDay = (allocPoints / totalAllocPoints) * rewardsPerDay;
  const apr =
    ((poolRewardsPerDay * prices[bananaAddress()].usd) / stakedTvl) * 365;

  return {
    address: pool.address,
    lpSymbol: pool.symbol,
    poolIndex: poolIndex,
    name: pool.name,
    price,
    tvl,
    stakedTvl,
    staked: pool.staked,
    apr,
    decimals: pool.decimals,
  };
}

export async function getTokenBalanceOfAddress(
  tokenContract,
  address,
): Promise<any> {
  const decimals = await tokenContract.methods.decimals().call();
  return (
    (await tokenContract.methods.balanceOf(address).call()) / 10 ** decimals
  );
}

export async function getTotalTokenSupply(tokenContract): Promise<any> {
  const decimals = await tokenContract.methods.decimals().call();
  return (await tokenContract.methods.totalSupply().call()) / 10 ** decimals;
}

/**** WALLET ENDPOINT FUNCTIONS ****/

// Get info given a wallet
export async function getWalletStats(httpService, wallet): Promise<any> {
  const poolPrices = await getAllStatsFull(httpService);
  const masterApeContract = getContract(
    MASTER_APE_ABI,
    masterApeContractAddress(),
  );
  const bananaContract = getContract(ERC20_ABI, bananaAddress());

  const walletStats = {
    tvl: 0,
    bananaPrice: poolPrices.bananaPrice,
    aggregateApr: 0,
    aggregateAprPerDay: 0,
    aggregateAprPerWeek: 0,
    aggregateAprPerMonth: 0,
    bananasEarnedPerDay: 0,
    bananasEarnedPerWeek: 0,
    bananasEarnedPerMonth: 0,
    bananasEarnedPerYear: 0,
    dollarsEarnedPerDay: 0,
    dollarsEarnedPerWeek: 0,
    dollarsEarnedPerMonth: 0,
    dollarsEarnedPerYear: 0,
    bananasInWallet: await getTokenBalanceOfAddress(bananaContract, wallet),
    pendingReward: 0,
    pools: await getWalletStatsForPools(
      wallet,
      poolPrices.pools,
      masterApeContract,
    ),
    farms: await getWalletStatsForFarms(
      wallet,
      poolPrices.farms,
      masterApeContract,
    ),
    incentivizedPools: await getWalletStatsForIncentivizedPools(
      wallet,
      poolPrices.incentivizedPools,
    ),
  };

  let totalApr = 0;

  walletStats.pools.forEach((pool) => {
    walletStats.pendingReward += pool.pendingReward;
    walletStats.tvl += pool.stakedTvl;
    totalApr += pool.stakedTvl * pool.apr;
  });

  walletStats.farms.forEach((farm) => {
    walletStats.pendingReward += farm.pendingReward;
    walletStats.tvl += farm.stakedTvl;
    totalApr += farm.stakedTvl * farm.apr;
  });

  walletStats.incentivizedPools.forEach((pool) => {
    walletStats.pendingReward += pool.pendingReward;
    walletStats.tvl += pool.stakedTvl;
    totalApr += pool.stakedTvl * pool.apr;
  });

  walletStats.aggregateApr = totalApr / walletStats.tvl;
  walletStats.aggregateAprPerDay = totalApr / 365 / walletStats.tvl;
  walletStats.aggregateAprPerWeek = (totalApr * 7) / 365 / walletStats.tvl;
  walletStats.aggregateAprPerMonth = (totalApr * 30) / 365 / walletStats.tvl;
  walletStats.bananasEarnedPerDay =
    (walletStats.tvl * walletStats.aggregateApr) / 365 / poolPrices.bananaPrice;
  walletStats.bananasEarnedPerWeek =
    (walletStats.tvl * walletStats.aggregateApr * 7) /
    365 /
    poolPrices.bananaPrice;
  walletStats.bananasEarnedPerMonth =
    (walletStats.tvl * walletStats.aggregateApr * 30) /
    365 /
    poolPrices.bananaPrice;
  walletStats.bananasEarnedPerYear =
    (walletStats.tvl * walletStats.aggregateApr) / poolPrices.bananaPrice;
  walletStats.dollarsEarnedPerDay =
    (walletStats.tvl * walletStats.aggregateApr) / 365;
  walletStats.dollarsEarnedPerWeek =
    (walletStats.tvl * walletStats.aggregateApr * 7) /
    365 /
    poolPrices.bananaPrice;
  walletStats.dollarsEarnedPerMonth =
    (walletStats.tvl * walletStats.aggregateApr * 30) /
    365 /
    poolPrices.bananaPrice;
  walletStats.dollarsEarnedPerYear =
    (walletStats.tvl * walletStats.aggregateApr) / poolPrices.bananaPrice;

  return walletStats;
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
        const curr_pool = {
          address: pool.address,
          lpSymbol: pool.lpSymbol,
          stakedTvl,
          pendingReward,
          apr: pool.apr,
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

        const curr_farm = {
          address: farm.address,
          lpSymbol: farm.lpSymbol,
          stakedTvl,
          pendingReward,
          apr: farm.apr,
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
        incentivizedPool.abi,
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
        const curr_pool = {
          address: incentivizedPool.address,
          lpSymbol: incentivizedPool.stakedTokenSymbol,
          stakedTvl,
          pendingReward,
          apr: incentivizedPool.apr,
        };

        allIncentivizedPools.push(curr_pool);
      }
    }),
  );
  return allIncentivizedPools;
}
