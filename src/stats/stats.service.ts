import {
  Injectable,
  HttpService,
  Inject,
  CACHE_MANAGER,
  Logger,
} from '@nestjs/common';
import { GeneralStats } from 'src/interfaces/stats/generalStats.interface';
import { Cache } from 'cache-manager';
import { getBscPrices } from 'src/utils/bsc_helpers';
import { LP_ABI } from './utils/abi/lpAbi';
import { ERC20_ABI } from './utils/abi/erc20Abi';
import { getContract, getCurrentBlock } from 'src/utils/lib/web3';
import { incentivizedPools } from 'src/utils/incentivizedPools';
import { getParameterCaseInsensitive } from 'src/utils/helpers';
import { getSubgraphData } from './utils/subgraph.utils';
import {
  masterApeContractWeb,
  bananaAddress,
  masterApeContractAddress,
  getBananaPriceWithPoolList,
  burnAddress,
  getPoolPrices,
  getWalletStatsForPools,
  getWalletStatsForFarms,
  getWalletStatsForIncentivizedPools,
} from './utils/stats.utils';
import { WalletStats } from 'src/interfaces/stats/walletStats.interface';
import { WalletInvalidHttpException } from './exceptions/wallet-invalid.execption';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
  ) {}

  async getAllStats(): Promise<GeneralStats> {
    const poolPrices: GeneralStats = await this.calculateStats();
    poolPrices.incentivizedPools.forEach((pool) => {
      delete pool.abi;
    });
    return poolPrices;
  }

  async getStatsForWallet(wallet): Promise<WalletStats> {
    try {
      const bananaContract = getContract(ERC20_ABI, bananaAddress());

      let walletStats: WalletStats = {
        tvl: 0,
        bananaPrice: 0,
        aggregateApr: 0,
        aggregateAprPerDay: 0,
        aggregateAprPerWeek: 0,
        aggregateAprPerMonth: 0,
        dollarsEarnedPerDay: 0,
        dollarsEarnedPerWeek: 0,
        dollarsEarnedPerMonth: 0,
        dollarsEarnedPerYear: 0,
        bananasEarnedPerDay: 0,
        bananasEarnedPerWeek: 0,
        bananasEarnedPerMonth: 0,
        bananasEarnedPerYear: 0,
        bananasInWallet: 0,
        pendingRewardUsd: 0,
        pendingRewardBanana: 0,
      };

      const [poolPrices, bananasInWallet] = await Promise.all([
        this.calculateStats(),
        this.getTokenBalanceOfAddress(bananaContract, wallet),
      ]);

      walletStats.bananaPrice = poolPrices.bananaPrice;
      walletStats.bananasInWallet = bananasInWallet;

      walletStats = await this.calculateWalletStats(
        walletStats,
        poolPrices,
        wallet,
      );

      return walletStats;
    } catch (error) {
      if (error.code == 'INVALID_ARGUMENT')
        throw new WalletInvalidHttpException();
      console.log(error);
      throw new Error(error.code);
    }
  }

  async calculateStats() {
    const cachedValue = await this.cacheManager.get('calculateStats');
    if (cachedValue) {
      this.logger.log('Hit calculateStats() cache');
      return cachedValue as GeneralStats;
    }

    const masterApeContract = masterApeContractWeb();

    const poolCount = parseInt(
      await masterApeContract.methods.poolLength().call(),
      10,
    );

    const poolInfos = await Promise.all(
      [...Array(poolCount).keys()].map(
        async (x) => await this.getPoolInfo(masterApeContract, x),
      ),
    );

    const [totalAllocPoints, prices, rewardsPerDay] = await Promise.all([
      masterApeContract.methods.totalAllocPoint().call(),
      getBscPrices(this.httpService),
      (((await masterApeContract.methods.cakePerBlock().call()) / 1e18) *
        86400) /
        3,
    ]);

    // If Banana price not returned from Gecko, calculating using pools
    if (!prices[bananaAddress()]) {
      prices[bananaAddress()] = {
        usd: getBananaPriceWithPoolList(poolInfos, prices),
      };
    }
    const priceUSD = prices[bananaAddress()].usd;

    const [tokens, { burntAmount, totalSupply }] = await Promise.all([
      this.getTokens(poolInfos),
      this.getBurnAndSupply(),
    ]);

    const poolPrices: GeneralStats = {
      bananaPrice: priceUSD,
      tvl: 0,
      totalVolume: 0,
      burntAmount,
      totalSupply,
      marketCap: totalSupply * priceUSD,
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
    poolPrices.pools.forEach((pool) => {
      poolPrices.tvl += pool.stakedTvl;
    });
    await Promise.all([
      this.mappingIncetivizedPools(poolPrices, prices),
      this.getTVLData(poolPrices),
    ]);

    await this.cacheManager.set('calculateStats', poolPrices, { ttl: 300 });

    return poolPrices;
  }

  async getPoolInfo(masterApeContract, poolIndex) {
    const poolInfo = await masterApeContract.methods.poolInfo(poolIndex).call();
    // Determine if Bep20 or Lp token
    const poolToken =
      poolIndex !== 0
        ? await this.getLpInfo(poolInfo.lpToken, masterApeContractAddress())
        : await this.getTokenInfo(poolInfo.lpToken, masterApeContractAddress());

    return {
      address: poolInfo.lpToken,
      allocPoints: poolInfo.allocPoint ?? 1,
      poolToken,
      poolIndex,
      lastRewardBlock: poolInfo.lastRewardBlock,
    };
  }

  async getLpInfo(tokenAddress, stakingAddress) {
    const contract = getContract(LP_ABI, tokenAddress);
    const [reserves, decimals, token0, token1] = await Promise.all([
      contract.methods.getReserves().call(),
      contract.methods.decimals().call(),
      contract.methods.token0().call(),
      contract.methods.token1().call(),
    ]);
    const [totalSupply, staked] = await Promise.all([
      (await contract.methods.totalSupply().call()) / 10 ** decimals,
      (await contract.methods.balanceOf(stakingAddress).call()) /
        10 ** decimals,
    ]);
    const q0 = reserves._reserve0;
    const q1 = reserves._reserve1;
    return {
      address: tokenAddress,
      token0,
      q0,
      token1,
      q1,
      totalSupply,
      stakingAddress,
      staked,
      decimals,
      tokens: [token0, token1],
    };
  }

  async getTokenInfo(tokenAddress, stakingAddress) {
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
    const [name, symbol, totalSupply, decimals] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.totalSupply().call(),
      contract.methods.decimals().call(),
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      totalSupply,
      decimals,
      staked:
        (await contract.methods.balanceOf(stakingAddress).call()) /
        10 ** decimals,
      tokens: [tokenAddress],
    };
  }

  async getBurnAndSupply() {
    const bananaContract = getContract(ERC20_ABI, bananaAddress());

    const decimals = await bananaContract.methods.decimals().call();

    const [burntAmount, totalSupply] = await Promise.all([
      (await bananaContract.methods.balanceOf(burnAddress()).call()) /
        10 ** decimals,
      (await bananaContract.methods.totalSupply().call()) / 10 ** decimals,
    ]);
    return {
      burntAmount,
      totalSupply,
    };
  }

  async getTokens(poolInfos) {
    const tokens = {};
    // eslint-disable-next-line prefer-spread
    const tokenAddresses = [].concat.apply(
      [],
      poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens),
    );

    await Promise.all(
      tokenAddresses.map(async (address) => {
        tokens[address] = await this.getTokenInfo(
          address,
          masterApeContractAddress(),
        );
      }),
    );

    return tokens;
  }
  async mappingIncetivizedPools(poolPrices, prices) {
    const currentBlockNumber = await getCurrentBlock();
    poolPrices.incentivizedPools = await Promise.all(
      incentivizedPools.map(
        async (pool) =>
          await this.getIncentivizedPoolInfo(pool, prices, currentBlockNumber),
      ),
    );
    poolPrices.incentivizedPools = poolPrices.incentivizedPools.filter(
      (x) => x,
    ); //filter null pools
  }

  async getIncentivizedPoolInfo(pool, prices, currentBlockNumber) {
    if (
      pool.startBlock > currentBlockNumber ||
      pool.endBlock < currentBlockNumber
    ) {
      return null;
    }
    const poolContract = getContract(pool.abi, pool.address);

    if (pool.stakeTokenIsLp) {
      const stakedTokenContract = getContract(LP_ABI, pool.stakeToken);
      const rewardTokenContract = getContract(ERC20_ABI, pool.rewardToken);
      const [
        reserves,
        stakedTokenDecimals,
        t0Address,
        t1Address,
        rewardDecimals,
      ] = await Promise.all([
        stakedTokenContract.methods.getReserves().call(),
        stakedTokenContract.methods.decimals().call(),
        stakedTokenContract.methods.token0().call(),
        stakedTokenContract.methods.token1().call(),
        rewardTokenContract.methods.decimals().call(),
      ]);

      const token0Contract = getContract(ERC20_ABI, t0Address);
      const token1Contract = getContract(ERC20_ABI, t1Address);

      const [
        token0decimals,
        token1decimals,
        totalSupply,
        stakedSupply,
        rewardsPerBlock,
        rewardTokenSymbol,
        t0Symbol,
        t1Symbol,
      ] = await Promise.all([
        token0Contract.methods.decimals().call(),
        token1Contract.methods.decimals().call(),
        (await stakedTokenContract.methods.totalSupply().call()) /
          10 ** stakedTokenDecimals,
        (await stakedTokenContract.methods.balanceOf(pool.address).call()) /
          10 ** stakedTokenDecimals,
        (await poolContract.methods.rewardPerBlock().call()) /
          10 ** rewardDecimals,
        rewardTokenContract.methods.symbol().call(),
        token0Contract.methods.symbol().call(),
        token1Contract.methods.symbol().call(),
      ]);

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
      const stakedTvl = (stakedSupply * tvl) / totalSupply;

      const rewardTokenPrice = getParameterCaseInsensitive(
        prices,
        pool.rewardToken,
      )?.usd;
      const apr =
        (rewardTokenPrice * ((rewardsPerBlock * 86400) / 3) * 365) / stakedTvl;

      return {
        name: `[${t0Symbol}]-[${t1Symbol}] LP`,
        address: pool.address,
        stakedTokenAddress: pool.stakeToken,
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
    }
    return null;
  }

  async getTVLData(poolPrices): Promise<any> {
    const { data } = await getSubgraphData(this.httpService);
    poolPrices.tvl += parseFloat(data.uniswapFactory.totalLiquidityUSD);
    poolPrices.totalVolume += parseFloat(data.uniswapFactory.totalVolumeUSD);
  }

  async getTokenBalanceOfAddress(tokenContract, address): Promise<any> {
    const decimals = await tokenContract.methods.decimals().call();
    return (
      (await tokenContract.methods.balanceOf(address).call()) / 10 ** decimals
    );
  }

  async calculateWalletStats(walletStats: WalletStats, poolPrices, wallet) {
    const masterApeContract = masterApeContractWeb();
    let totalApr = 0;

    const [pools, farms, incentivezed] = await Promise.all([
      getWalletStatsForPools(wallet, poolPrices.pools, masterApeContract),
      getWalletStatsForFarms(wallet, poolPrices.farms, masterApeContract),
      getWalletStatsForIncentivizedPools(wallet, poolPrices.incentivizedPools),
    ]);
    walletStats.pools = pools;
    walletStats.farms = farms;
    walletStats.incentivizedPools = incentivezed;

    walletStats.pools.forEach((pool) => {
      walletStats.pendingRewardUsd += pool.pendingRewardUsd;
      walletStats.pendingRewardBanana += pool.pendingReward;
      walletStats.dollarsEarnedPerDay += pool.dollarsEarnedPerDay;
      walletStats.dollarsEarnedPerWeek += pool.dollarsEarnedPerWeek;
      walletStats.dollarsEarnedPerMonth += pool.dollarsEarnedPerMonth;
      walletStats.dollarsEarnedPerYear += pool.dollarsEarnedPerYear;
      walletStats.bananasEarnedPerDay += pool.tokensEarnedPerDay;
      walletStats.bananasEarnedPerWeek += pool.tokensEarnedPerWeek;
      walletStats.bananasEarnedPerMonth += pool.tokensEarnedPerMonth;
      walletStats.bananasEarnedPerYear += pool.tokensEarnedPerYear;
      walletStats.tvl += pool.stakedTvl;
      totalApr += pool.stakedTvl * pool.apr;
    });

    walletStats.farms.forEach((farm) => {
      walletStats.pendingRewardUsd += farm.pendingRewardUsd;
      walletStats.pendingRewardBanana += farm.pendingReward;
      walletStats.dollarsEarnedPerDay += farm.dollarsEarnedPerDay;
      walletStats.dollarsEarnedPerWeek += farm.dollarsEarnedPerWeek;
      walletStats.dollarsEarnedPerMonth += farm.dollarsEarnedPerMonth;
      walletStats.dollarsEarnedPerYear += farm.dollarsEarnedPerYear;
      walletStats.bananasEarnedPerDay += farm.tokensEarnedPerDay;
      walletStats.bananasEarnedPerWeek += farm.tokensEarnedPerWeek;
      walletStats.bananasEarnedPerMonth += farm.tokensEarnedPerMonth;
      walletStats.bananasEarnedPerYear += farm.tokensEarnedPerYear;
      walletStats.tvl += farm.stakedTvl;
      totalApr += farm.stakedTvl * farm.apr;
    });

    walletStats.incentivizedPools.forEach((incentivizedPool) => {
      walletStats.pendingRewardUsd += incentivizedPool.pendingRewardUsd;
      walletStats.dollarsEarnedPerDay += incentivizedPool.dollarsEarnedPerDay;
      walletStats.dollarsEarnedPerWeek += incentivizedPool.dollarsEarnedPerWeek;
      walletStats.dollarsEarnedPerMonth +=
        incentivizedPool.dollarsEarnedPerMonth;
      walletStats.dollarsEarnedPerYear += incentivizedPool.dollarsEarnedPerYear;
      walletStats.tvl += incentivizedPool.stakedTvl;
      totalApr += incentivizedPool.stakedTvl * incentivizedPool.apr;
    });

    walletStats.aggregateApr = walletStats.tvl ? totalApr / walletStats.tvl : 0;
    walletStats.aggregateAprPerDay = walletStats.aggregateApr / 365;
    walletStats.aggregateAprPerWeek = (walletStats.aggregateApr * 7) / 365;
    walletStats.aggregateAprPerMonth = (walletStats.aggregateApr * 30) / 365;

    return walletStats;
  }
}
