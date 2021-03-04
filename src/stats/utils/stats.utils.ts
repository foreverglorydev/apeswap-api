import { PromisifyBatchRequest } from 'src/utils/lib/PromiseBatchRequest';
import { getContract } from 'src/utils/lib/web3';
import { getBscPrices, loadMasterChefInfo } from 'src/utils/bsc_helpers';
import { tokenType } from 'src/utils/helpers';

import masterChefABI from './masterChefABI.json';
import configuration from 'src/config/configuration';
import { poolBalance } from 'src/pairs/pairs.queries';
import { ERC20_ABI } from './erc20Abi';
import { UNI_ABI } from './uniAbi';

function masterChefContractAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.masterApe;
}

function bananaAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.banana;
}

function bananaBusdAddress(): string {
  return configuration()[process.env.CHAIN_ID].contracts.bananaBusd;
}

export function getStatsContract() {
  return getContract(masterChefABI, masterChefContractAddress());
}

export async function getReward(): Promise<any> {
  const MasterChefContract = getContract(
    masterChefABI,
    masterChefContractAddress(),
  );
  const rewards =
    (((await MasterChefContract.methods.cakePerBlock().call()) / 1e18) *
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
  const poolIndex = 2;
  const myAddress = process.env.TEST_ADDRESS;
  const masterChefContract = getContract(
    masterChefABI,
    masterChefContractAddress(),
  );
  const prices = await getBscPrices(httpService);
  const tokens = {};

  const poolCount = parseInt(
    await masterChefContract.methods.poolLength().call(),
    10,
  );
  const totalAllocPoints = await masterChefContract.methods
    .totalAllocPoint()
    .call();

  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) => await getBscPoolInfo(masterChefContract, x, myAddress),
    ),
  );

  // eslint-disable-next-line prefer-spread
  const tokenAddresses = [].concat.apply(
    [],
    poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens),
  );

  console.log('TOKEN LIST:', tokenAddresses);

  await Promise.all(
    tokenAddresses.map(async (address) => {
      tokens[address] = await getBscToken(
        address,
        masterChefContractAddress(),
        myAddress,
      );
    }),
  );

  prices[bananaAddress()] = { usd: getBananaPriceWithPoolList(poolInfos) };

  const poolPrices = poolInfos.map((poolInfo) =>
    poolInfo.poolToken
      ? getPoolPrices(tokens, prices, poolInfo.poolToken)
      : undefined,
  );
  const rewardsPerWeek = await getReward();

  return 1;
}

function getPoolPrices(tokens, prices, pool) {
  if (pool.token0 != null) return getLPTokenPrices(tokens, prices, pool);
  return getBep20Prices(prices, pool);
  /*
  if (pool.poolTokens != null) return getBalancerPrices(tokens, prices, pool);
  if (pool.virtualPrice != null) return getCurvePrices(prices, pool);
  if (pool.token != null) return getWrapPrices(tokens, prices, pool);
  */
}

function getParameterCaseInsensitive(object, key) {
  return object[
    Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase())
  ];
}

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
  let stakeTokenTicker = `[${t0.symbol}]-[${t1.symbol}]`;

  console.log('Price for LP pair:', stakeTokenTicker);
  console.log('T0: ' + t0.symbol + ', price: ' + p0);
  console.log('T1: ' + t1.symbol + ', price: ' + p1);
  if (pool.is1inch) stakeTokenTicker += ' 1INCH LP';
  else if (pool.symbol.includes('LSLP')) stakeTokenTicker += ' LSLP';
  else if (pool.symbol.includes('SLP')) stakeTokenTicker += ' SLP';
  else stakeTokenTicker += ' Uni LP';
  return {
    t0: t0,
    p0: p0,
    q0: q0,
    t1: t1,
    p1: p1,
    q1: q1,
    price: price,
    tvl: tvl,
    staked_tvl: staked_tvl,
    stakeTokenTicker: stakeTokenTicker,
  };
}

function getBep20Prices(prices, pool) {
  const price = getParameterCaseInsensitive(prices, pool.address)?.usd;
  const tvl = (pool.totalSupply * price) / 10 ** pool.decimals;
  const staked_tvl = pool.staked * price;

  console.log('Price for ' + pool.symbol + ' is ' + price);
  return {
    staked_tvl: staked_tvl,
    price: price,
    stakeTokenTicker: pool.symbol,
  };
}

async function getBscPoolInfo(masterChefContract, poolIndex, myAddress) {
  const poolInfo = await masterChefContract.methods.poolInfo(poolIndex).call();
  const poolToken =
    poolIndex !== 0
      ? await getBscLpToken(
          poolInfo.lpToken,
          masterChefContractAddress(),
          myAddress,
        )
      : await getBscToken(
          poolInfo.lpToken,
          masterChefContractAddress(),
          myAddress,
        );
  const userInfo = await masterChefContract.methods
    .userInfo(poolIndex, myAddress)
    .call();
  const pendingRewardTokens = await masterChefContract.methods
    .pendingCake(poolIndex, myAddress)
    .call();

  const staked = userInfo.amount / 10 ** poolToken.decimals;

  /* let stakedToken;
  let userLPStaked;
  if (
    poolInfo.stakedHoldableToken != null &&
    poolInfo.stakedHoldableToken != '0x0000000000000000000000000000000000000000'
  ) {
    // TODO re check - Probably not needed
    stakedToken = await getBscToken(
      poolInfo.stakedHoldableToken,
      masterChefAddress,
      myAddress,
    );
    userLPStaked = userInfo.stakedLPAmount / 10 ** poolToken.decimals;
  } */
  return {
    address: poolInfo.lpToken,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken: poolToken,
    userStaked: staked,
    pendingRewardTokens: pendingRewardTokens / 10 ** 18,
    // stakedToken: stakedToken,
    // userLPStaked: userLPStaked,
    lastRewardBlock: poolInfo.lastRewardBlock,
  };
}

async function getBscToken(tokenAddress, stakingAddress, userAddress) {
  const bep20 = getContract(ERC20_ABI, tokenAddress);
  return await getBep20(bep20, tokenAddress, stakingAddress, userAddress);
}

async function getBscLpToken(tokenAddress, stakingAddress, userAddress) {
  const uni = getContract(UNI_ABI, tokenAddress);
  return await getBscUniPool(uni, tokenAddress, stakingAddress, userAddress);
}

async function getBep20(token, address, stakingAddress, userAddress) {
  if (address == '0x0000000000000000000000000000000000000000') {
    return {
      address,
      name: 'Binance',
      symbol: 'BNB',
      totalSupply: 1e8,
      decimals: 18,
      staked: 0,
      unstaked: 0,
      contract: null,
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
    unstaked:
      (await token.methods.balanceOf(userAddress).call()) / 10 ** decimals,
    contract: token,
    tokens: [address],
  };
}

async function getBscUniPool(pool, poolAddress, stakingAddress, userAddress) {
  const reserves = await pool.methods.getReserves().call();
  const q0 = reserves._reserve0;
  const q1 = reserves._reserve1;
  const decimals = await pool.methods.decimals().call();
  const token0 = await pool.methods.token0().call();
  const token1 = await pool.methods.token1().call();
  return {
    symbol: await pool.methods.symbol().call(),
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
    unstaked:
      (await pool.methods.balanceOf(userAddress).call()) / 10 ** decimals,
    contract: pool,
    tokens: [token0, token1],
    is1inch: false,
  };
}
