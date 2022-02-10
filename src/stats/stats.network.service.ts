import {
    Injectable,
    HttpService,
    Inject,
    CACHE_MANAGER,
    Logger,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { GeneralStats } from 'src/interfaces/stats/generalStats.dto';
  import { Cache } from 'cache-manager';
  import { PriceService } from './price.service';
  import { LP_ABI } from './utils/abi/lpAbi';
  import { ERC20_ABI } from './utils/abi/erc20Abi';
  import { LENDING_ABI } from './utils/abi/lendingAbi';
  import { getContract, getCurrentBlock } from 'src/utils/lib/web3';
  import {
    getParameterCaseInsensitive,
    createLpPairName,
  } from 'src/utils/helpers';
  import { multicall, multicallNetwork } from 'src/utils/lib/multicall';
  import {
    gBananaTreasury,
    masterApeContractWeb,
    bananaAddress,
    goldenBananaAddress,
    masterApeContractAddress,
    getBananaPriceWithPoolList,
    burnAddress,
    getPoolPrices,
    getWalletStatsForPools,
    getWalletStatsForFarms,
    getWalletStatsForIncentivizedPools,
    lendingAddress,
    unitrollerAddress,
    masterApeContractNetwork,
    masterApeContractAddressNetwork,
    lpAbiNetwork,
    erc20AbiNetwork,
  } from './utils/stats.utils';
  import { WalletStats } from 'src/interfaces/stats/walletStats.dto';
  import { WalletInvalidHttpException } from './exceptions/wallet-invalid.execption';
  import { Model } from 'mongoose';
  import {
    GeneralStats as GeneralStatsDB,
    GeneralStatsDocument,
  } from './schema/generalStats.schema';
  import { SubgraphService } from './subgraph.service';
  import { Cron } from '@nestjs/schedule';
  import { BEP20_REWARD_APE_ABI } from './utils/abi/bep20RewardApeAbi';
  import { GeneralStatsChain } from 'src/interfaces/stats/generalStatsChain.dto';
  import { TvlStats, TvlStatsDocument } from './schema/tvlStats.schema';
  
  @Injectable()
  export class StatsNetworkService {
    private readonly logger = new Logger(StatsNetworkService.name);
    private readonly chainId = parseInt(process.env.CHAIN_ID);
    private readonly POOL_LIST_URL = process.env.POOL_LIST_URL;
  
    constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private httpService: HttpService,
      @InjectModel(GeneralStatsDB.name)
      private generalStatsModel: Model<GeneralStatsDocument>,
      @InjectModel(TvlStats.name)
      private tvlStatsModel: Model<TvlStatsDocument>,
      private subgraphService: SubgraphService,
      private priceService: PriceService,
    ) {}
  
    createTvlStats(stats) {
      return this.tvlStatsModel.updateOne(
        {},
        {
          $set: stats,
          $currentDate: {
            createdAt: true,
          },
        },
        {
          upsert: true,
          timestamps: true,
        },
      );
    }
  
    findTvlStats() {
      return this.tvlStatsModel.findOne();
    }
    updateTvlCreatedAtStats() {
      return this.tvlStatsModel.updateOne(
        {},
        {
          $currentDate: {
            createdAt: true,
          },
        },
      );
    }
    createGeneralStats(stats) {
      return this.generalStatsModel.updateOne(
        {},
        {
          $set: stats,
          $currentDate: {
            createdAt: true,
          },
        },
        {
          upsert: true,
          timestamps: true,
        },
      );
    }
  
    findGeneralStats() {
      return this.generalStatsModel.findOne();
    }
    updateCreatedAtStats() {
      return this.generalStatsModel.updateOne(
        {},
        {
          $currentDate: {
            createdAt: true,
          },
        },
      );
    }
    cleanStats() {
      return this.generalStatsModel.deleteMany();
    }
  
    async verifyStats(model) {
      const now = Date.now();
      const stats: any =
        model === 'general'
          ? await this.findGeneralStats()
          : await this.findTvlStats();
      if (!stats?.createdAt) return null;
  
      const lastCreatedAt = new Date(stats.createdAt).getTime();
      const diff = now - lastCreatedAt;
      const time = 300000; // 5 minutes
  
      if (diff > time) return null;
  
      return stats;
    }
  
    async getStatsNetwork(chainId: number): Promise<any> {
      try {
        
        const masterApeContract = masterApeContractNetwork(chainId);
        const poolCount = parseInt(
          await masterApeContract.methods.poolLength().call(),
          10,
          );
        
        const poolInfos = await Promise.all(
          [...Array(poolCount).keys()].map(async (x) =>
            this.getPoolInfoNetwork(masterApeContract, x, chainId),
          ),
        );
  
        const [totalAllocPoints, prices, rewardsPerDay] = await Promise.all([
          masterApeContract.methods.totalAllocPoint().call(),
          this.priceService.getTokenPricesv2(chainId),
          (((await masterApeContract.methods.cakePerBlock().call()) / 1e18) *
            86400) /
          3,
        ]);
  
        // Set GoldenBanana Price = banana price / 0.72
        prices[goldenBananaAddress()] = {
          usd: prices[bananaAddress()].usd / 0.72,
        };
  
        const priceUSD = prices[bananaAddress()].usd;
  
        const [
          tokens,
          { burntAmount, totalSupply, circulatingSupply },
          //{ tvl, totalLiquidity, totalVolume },
        ] = await Promise.all([
          this.getTokensNetwork(poolInfos, chainId),
          this.getBurnAndSupply(),
          //this.getTvlStats(),
        ]);
  
        // const poolPrices: GeneralStats = {
        //   bananaPrice: priceUSD,
        //   tvl,
        //   poolsTvl: 0,
        //   totalLiquidity,
        //   totalVolume,
        //   burntAmount,
        //   totalSupply,
        //   circulatingSupply,
        //   marketCap: circulatingSupply * priceUSD,
        //   pools: [],
        //   farms: [],
        //   incentivizedPools: [],
        // };
  
        // for (let i = 0; i < poolInfos.length; i++) {
        //   if (poolInfos[i].poolToken) {
        //     getPoolPrices(
        //       tokens,
        //       prices,
        //       poolInfos[i].poolToken,
        //       poolPrices,
        //       i,
        //       poolInfos[i].allocPoints,
        //       totalAllocPoints,
        //       rewardsPerDay,
        //     );
        //   }
        // }
  
        // poolPrices.pools.forEach((pool) => {
        //   poolPrices.poolsTvl += pool.stakedTvl;
        // });
  
        // await Promise.all([this.mappingIncetivizedPools(poolPrices, prices)]);
  
        // poolPrices.incentivizedPools.forEach((pool) => {
        //   if (!pool.t0Address) {
        //     poolPrices.poolsTvl += pool.stakedTvl;
        //   }
        // });
  
        // await this.cacheManager.set('calculateStats', poolPrices, { ttl: 120 });
        // await this.createGeneralStats(poolPrices);
  
        return poolInfos;
      } catch (e) {
        this.logger.error('Something went wrong calculating stats network');
        console.log(e);
      }
    }
    
    async getPoolInfoNetwork(masterApeContract, poolIndex, chainId: number) {
      let lpToken;
      const poolInfo = await masterApeContract.methods.poolInfo(poolIndex).call();
      lpToken = poolInfo.lpToken
      if(!lpToken) {
        lpToken = await masterApeContract.methods.lpToken(poolIndex).call();
      }
      let poolToken;
      try {
        poolToken = await this.getLpInfoNetwork(lpToken, masterApeContractAddressNetwork(chainId), chainId)
      } catch (error) { }
  
      return {
        address: lpToken,
        allocPoints: poolInfo.allocPoint ?? 1,
        poolToken,
        poolIndex,
        lastRewardBlock: poolInfo.lastRewardBlock,
      };
    }
  
    async getLpInfoNetwork(tokenAddress, stakingAddress, chainId) {
      try {
        const [reserves, decimals, token0, token1] = await multicallNetwork(lpAbiNetwork(chainId), [
          {
            address: tokenAddress,
            name: 'getReserves',
          },
          {
            address: tokenAddress,
            name: 'decimals',
          },
          {
            address: tokenAddress,
            name: 'token0',
          },
          {
            address: tokenAddress,
            name: 'token1',
          },
        ], chainId);
        
        let [totalSupply, staked] = await multicallNetwork(lpAbiNetwork(chainId), [
          {
            address: tokenAddress,
            name: 'totalSupply',
          },
          {
            address: tokenAddress,
            name: 'balanceOf',
            params: [stakingAddress],
          },
        ], chainId);
  
        totalSupply /= 10 ** decimals[0];
        staked /= 10 ** decimals[0];
  
        const q0 = reserves._reserve0;
        const q1 = reserves._reserve1;
        return {
          address: tokenAddress,
          token0: token0[0],
          q0,
          token1: token1[0],
          q1,
          totalSupply,
          stakingAddress,
          staked,
          decimals: decimals[0],
          tokens: [token0[0], token1[0]],
        };
      } catch (error) {
        console.log('inusual ', tokenAddress);
        console.log(error);
      }
    }
    
    async getTokenInfoNetwork(tokenAddress, stakingAddress, chainId) {
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
  
      // HOTFIX for Rocket token (Rocket contract currently incompatible with ERC20_ABI)
      if (tokenAddress == '0x3bA5aee47Bb7eAE40Eb3D06124a74Eb89Da8ffd2') {
        const contract = getContract(
          LP_ABI,
          '0x93fa1A6357De25031311f784342c33A26Cb1C87A', // ROCKET-BNB LP pair address
        );
        const reserves = await contract.methods.getReserves().call();
        const q0 = reserves._reserve0 / 10 ** 18;
  
        return {
          address: tokenAddress,
          name: 'Rocket',
          symbol: 'ROCKET',
          totalSupply: 1000000000,
          decimals: 18,
          staked: q0,
          tokens: [tokenAddress],
        };
      }
  
      const [name, symbol, totalSupply, decimals, staked] = await multicallNetwork(
        erc20AbiNetwork(chainId),
        [
          {
            address: tokenAddress,
            name: 'name',
          },
          {
            address: tokenAddress,
            name: 'symbol',
          },
          {
            address: tokenAddress,
            name: 'totalSupply',
          },
          {
            address: tokenAddress,
            name: 'decimals',
          },
          {
            address: tokenAddress,
            name: 'balanceOf',
            params: [stakingAddress],
          },
        ],
        chainId
      );
  
      return {
        address: tokenAddress,
        name: name[0],
        symbol: symbol[0],
        totalSupply: totalSupply[0],
        decimals: decimals[0],
        staked: staked[0] / 10 ** decimals[0],
        tokens: [tokenAddress],
      };
    }
  
    async getBurnAndSupply() {
      const bananaContract = getContract(ERC20_ABI, bananaAddress());
  
      const decimals = await bananaContract.methods.decimals().call();
  
      const [burned, supply] = await Promise.all([
        bananaContract.methods.balanceOf(burnAddress()).call(),
        bananaContract.methods.totalSupply().call(),
      ]);
  
      const burntAmount = burned / 10 ** decimals;
      const totalSupply = supply / 10 ** decimals;
      const circulatingSupply = totalSupply - burntAmount;
  
      return {
        burntAmount,
        totalSupply,
        circulatingSupply,
      };
    }
  
    async getGnanaSupply() {
      const gnanaContract = getContract(ERC20_ABI, goldenBananaAddress());
  
      const decimals = await gnanaContract.methods.decimals().call();
  
      const [treasury, supply] = await Promise.all([
        gnanaContract.methods.balanceOf(gBananaTreasury()).call(),
        gnanaContract.methods.totalSupply().call(),
      ]);
  
      const treasuryAmount = treasury / 10 ** decimals;
      const totalSupply = supply / 10 ** decimals;
      const circulatingSupply = totalSupply - treasuryAmount;
  
      return {
        circulatingSupply,
      };
    }
  
    async getTokensNetwork(poolInfos, chainId) {
      const tokens = {};
      // eslint-disable-next-line prefer-spread
      const tokenAddresses = [].concat.apply(
        [],
        poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens),
      );
  
      await Promise.all(
        tokenAddresses.map(async (address) => {
          tokens[address] = await this.getTokenInfoNetwork(
            address,
            masterApeContractNetwork(chainId),
            chainId
          );
        }),
      );
  
      return tokens;
    }

    async mappingIncetivizedPools(poolPrices, prices) {
      const currentBlockNumber = await getCurrentBlock();
      const pools = await this.getIncentivizedPools();
      poolPrices.incentivizedPools = await Promise.all(
        pools.map(async (pool) =>
          this.getIncentivizedPoolInfo(pool, prices, currentBlockNumber),
        ),
      );
      poolPrices.incentivizedPools = poolPrices.incentivizedPools.filter(
        (x) => x,
      ); //filter null pools
    }
  
    async getIncentivizedPoolInfo(pool, prices, currentBlockNumber) {
      const active =
        pool.startBlock <= currentBlockNumber &&
        pool.bonusEndBlock >= currentBlockNumber;
      const poolContract = getContract(pool.abi, pool.address);
  
      if (pool.stakeTokenIsLp) {
        const [
          reserves,
          stakedTokenDecimals,
          t0Address,
          t1Address,
        ] = await multicall(LP_ABI, [
          {
            address: pool.stakeToken,
            name: 'getReserves',
          },
          {
            address: pool.stakeToken,
            name: 'decimals',
          },
          {
            address: pool.stakeToken,
            name: 'token0',
          },
          {
            address: pool.stakeToken,
            name: 'token1',
          },
        ]);
  
        const rewardTokenContract = getContract(ERC20_ABI, pool.rewardToken);
        const rewardDecimals = await rewardTokenContract.methods
          .decimals()
          .call();
  
        const [
          token0decimals,
          token1decimals,
          rewardTokenSymbol,
          t0Symbol,
          t1Symbol,
        ] = await multicall(ERC20_ABI, [
          {
            address: t0Address[0],
            name: 'decimals',
          },
          {
            address: t1Address[0],
            name: 'decimals',
          },
          {
            address: pool.rewardToken,
            name: 'symbol',
          },
          {
            address: t0Address[0],
            name: 'symbol',
          },
          {
            address: t1Address[0],
            name: 'symbol',
          },
        ]);
  
        let [totalSupply, stakedSupply] = await multicall(LP_ABI, [
          {
            address: pool.stakeToken,
            name: 'totalSupply',
          },
          {
            address: pool.stakeToken,
            name: 'balanceOf',
            params: [pool.address],
          },
        ]);
  
        totalSupply = totalSupply / 10 ** stakedTokenDecimals[0];
        stakedSupply = stakedSupply / 10 ** stakedTokenDecimals[0];
        const rewardsPerBlock =
          (await poolContract.methods.rewardPerBlock().call()) /
          10 ** rewardDecimals;
  
        const q0 = reserves._reserve0 / 10 ** token0decimals[0];
        const q1 = reserves._reserve1 / 10 ** token1decimals[0];
  
        let p0 = getParameterCaseInsensitive(prices, t0Address[0])?.usd;
        let p1 = getParameterCaseInsensitive(prices, t1Address[0])?.usd;
  
        if (p0 == null && p1 == null) {
          return undefined;
        }
        if (p0 == null) {
          p0 = (q1 * p1) / q0;
          prices[t0Address[0]] = { usd: p0 };
        }
        if (p1 == null) {
          p1 = (q0 * p0) / q1;
          prices[t1Address[0]] = { usd: p1 };
        }
  
        const tvl = q0 * p0 + q1 * p1;
        const stakedTvl = (stakedSupply * tvl) / totalSupply;
  
        const rewardTokenPrice = getParameterCaseInsensitive(
          prices,
          pool.rewardToken,
        )?.usd;
        const apr = active
          ? (rewardTokenPrice * ((rewardsPerBlock * 86400) / 3) * 365) / stakedTvl
          : 0;
  
        return {
          id: pool.sousId,
          name: createLpPairName(t0Symbol[0], t1Symbol[0]),
          address: pool.address,
          active,
          blocksRemaining: active ? pool.bonusEndBlock - currentBlockNumber : 0,
          stakedTokenAddress: pool.stakeToken,
          t0Address: t0Address[0],
          t0Symbol: t0Symbol[0],
          p0,
          q0,
          t1Address: t1Address[0],
          t1Symbol: t1Symbol[0],
          p1,
          q1,
          totalSupply,
          stakedSupply,
          rewardDecimals,
          stakedTokenDecimals: stakedTokenDecimals[0],
          tvl,
          stakedTvl,
          apr,
          rewardTokenPrice,
          rewardTokenSymbol: rewardTokenSymbol[0],
          price: tvl / totalSupply,
          abi: pool.abi,
        };
      } else {
        let stakedTokenPrice = getParameterCaseInsensitive(
          prices,
          pool.stakeToken,
        )?.usd;
  
        // If token is not trading on DEX, assign price = 0
        if (isNaN(stakedTokenPrice)) {
          stakedTokenPrice = 0;
        }
  
        let rewardTokenPrice = getParameterCaseInsensitive(
          prices,
          pool.rewardToken,
        )?.usd;
  
        // If token is not trading on DEX, assign price = 0
        if (isNaN(rewardTokenPrice)) {
          rewardTokenPrice = 0;
        }
  
        const [
          name,
          stakedTokenDecimals,
          rewardDecimals,
          rewardTokenSymbol,
        ] = await multicall(ERC20_ABI, [
          {
            address: pool.stakeToken,
            name: 'symbol',
          },
          {
            address: pool.stakeToken,
            name: 'decimals',
          },
          {
            address: pool.rewardToken,
            name: 'decimals',
          },
          {
            address: pool.rewardToken,
            name: 'symbol',
          },
        ]);
  
        let [totalSupply, stakedSupply] = await multicall(ERC20_ABI, [
          {
            address: pool.stakeToken,
            name: 'totalSupply',
          },
          {
            address: pool.stakeToken,
            name: 'balanceOf',
            params: [pool.address],
          },
        ]);
        totalSupply = totalSupply / 10 ** stakedTokenDecimals[0];
        stakedSupply = stakedSupply / 10 ** stakedTokenDecimals[0];
        const rewardsPerBlock =
          (await poolContract.methods.rewardPerBlock().call()) /
          10 ** rewardDecimals[0];
        const tvl = totalSupply * stakedTokenPrice;
        const stakedTvl = (stakedSupply * tvl) / totalSupply;
  
        let apr = 0;
        if (active && stakedTokenPrice != 0) {
          apr =
            (rewardTokenPrice * ((rewardsPerBlock * 86400) / 3) * 365) /
            stakedTvl;
        }
  
        return {
          id: pool.sousId,
          name: name[0],
          address: pool.address,
          active,
          blocksRemaining: active ? pool.bonusEndBlock - currentBlockNumber : 0,
          rewardTokenAddress: pool.rewardToken,
          stakedTokenAddress: pool.stakeToken,
          totalSupply,
          stakedSupply,
          rewardDecimals: rewardDecimals[0],
          stakedTokenDecimals: stakedTokenDecimals[0],
          tvl,
          stakedTvl,
          apr,
          rewardTokenPrice,
          rewardTokenSymbol: rewardTokenSymbol[0],
          price: stakedTokenPrice,
          abi: pool.abi,
        };
      }
    }
  
    async getTokenBalanceOfAddress(tokenContract, address): Promise<any> {
      const decimals = await tokenContract.methods.decimals().call();
      return (
        (await tokenContract.methods.balanceOf(address).call()) / 10 ** decimals
      );
    }
  
    async getIncentivizedPools() {
      const { data } = await this.httpService.get(this.POOL_LIST_URL).toPromise();
      console.log(data);
      const pools = data
        .map((pool) => ({
          sousId: pool.sousId,
          name: pool.name,
          address: pool.contractAddress[this.chainId],
          stakeToken: pool.stakingToken.address[this.chainId],
          stakeTokenIsLp: pool.stakingToken.lpToken,
          rewardToken: pool.rewardToken.address[this.chainId],
          rewardPerBlock: pool.rewardPerBlock,
          startBlock: pool.startBlock,
          bonusEndBlock: pool.bonusEndBlock,
          abi: this.getABI(pool.abi),
        }))
        .filter(({ sousId }) => sousId !== 0);
  
      return pools;
    }
  
    getABI(value) {
      switch (value) {
        case 'BEP20_REWARD_APE_ABI':
          return BEP20_REWARD_APE_ABI;
  
        default:
          return BEP20_REWARD_APE_ABI;
      }
    }
  }
  