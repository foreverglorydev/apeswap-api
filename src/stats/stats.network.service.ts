import {
  Injectable,
  HttpService,
  Inject,
  CACHE_MANAGER,
  Logger,
} from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { InjectModel } from '@nestjs/mongoose';
import {
  GeneralStats,
  GeneralStatsNetworkDto,
} from 'src/interfaces/stats/generalStats.dto';
import { Cache } from 'cache-manager';
import { PriceService } from './price.service';
import { multicallNetwork } from 'src/utils/lib/multicall';
import {
  getPoolPrices,
  masterApeContractNetwork,
  masterApeContractAddressNetwork,
  erc20AbiNetwork,
  bananaAddressNetwork,
  getDualFarmApr,
  masterApeAbiNetwork,
} from './utils/stats.utils';
import { Model } from 'mongoose';
import { getBalanceNumber } from 'src/utils/math';
import { MINI_COMPLEX_REWARDER_ABI } from './utils/abi/miniComplexRewarderAbi';
import configuration from 'src/config/configuration';
import {
  GeneralStatsNetwork,
  GeneralStatsNetworkDocument,
} from './schema/generalStatsNetwork.schema';
import { StatsService } from './stats.service';

@Injectable()
export class StatsNetworkService {
  private readonly logger = new Logger(StatsNetworkService.name);
  private readonly DUAL_FARMS_LIST_URL = process.env.DUAL_FARMS_LIST_URL;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    @InjectModel(GeneralStatsNetwork.name)
    private generalStatsNetworkModel: Model<GeneralStatsNetworkDocument>,
    private priceService: PriceService,
    private statsService: StatsService,
  ) {}

  createGeneralStats(stats, filter) {
    return this.generalStatsNetworkModel.updateOne(
      filter,
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

  findGeneralStats(filter) {
    return this.generalStatsNetworkModel.findOne(filter);
  }
  updateCreatedAtStats(filter) {
    return this.generalStatsNetworkModel.updateOne(filter, {
      $currentDate: {
        createdAt: true,
      },
    });
  }

  async verifyStats(chainId) {
    const now = Date.now();
    const stats: any = await this.findGeneralStats({ chainId });
    if (!stats?.createdAt) return null;

    const lastCreatedAt = new Date(stats.createdAt).getTime();
    const diff = now - lastCreatedAt;
    const time = 300000; // 5 minutes

    if (diff > time) return null;

    return stats;
  }

  async getCalculateStatsNetwork(chainId: number) {
    const cachedValue = await this.cacheManager.get(
      `calculateStats-network-${chainId}`,
    );
    if (cachedValue) {
      this.logger.log('Hit calculateStatsNetwork() cache');
      return cachedValue as GeneralStats;
    }
    const infoStats = await this.verifyStats(chainId);
    if (infoStats) return infoStats;
    await this.updateCreatedAtStats({ chainId });
    this.getStatsNetwork(chainId);
    const generalStats: any = await this.findGeneralStats({ chainId });
    return generalStats;
  }

  async getStatsNetwork(chainId: number): Promise<any> {
    try {
      const masterApeContract = masterApeContractNetwork(chainId);

      const [
        prices,
        { burntAmount, totalSupply, circulatingSupply },
      ] = await Promise.all([
        this.priceService.getTokenPricesv2(chainId),
        this.statsService.getBurnAndSupply(chainId),
      ]);
      const priceUSD = prices[bananaAddressNetwork(chainId)].usd;
      const generalStats: GeneralStatsNetworkDto = {
        chainId: +chainId,
        bananaPrice: priceUSD,
        burntAmount,
        totalSupply,
        circulatingSupply,
        marketCap: circulatingSupply * priceUSD,
        poolsTvl: 0,
        pools: [],
        farms: [],
        incentivizedPools: [],
      };

      switch (+chainId) {
        case configuration().networksId.BSC:
          const poolInfos = await this.statsService.calculatePoolInfo(
            masterApeContract,
          );

          const [
            { totalAllocPoints, rewardsPerDay },
            tokens,
            { circulatingSupply: gnanaCirculatingSupply },
          ] = await Promise.all([
            this.statsService.getAllocPointAndRewards(masterApeContract),
            this.statsService.getTokens(poolInfos),
            this.statsService.getGnanaSupply(),
          ]);

          generalStats.gnanaCirculatingSupply = gnanaCirculatingSupply;

          for (let i = 0; i < poolInfos.length; i++) {
            if (poolInfos[i].poolToken) {
              getPoolPrices(
                tokens,
                prices,
                poolInfos[i].poolToken,
                generalStats,
                i,
                poolInfos[i].allocPoints,
                totalAllocPoints,
                rewardsPerDay,
              );
            }
          }

          generalStats.pools.forEach((pool) => {
            generalStats.poolsTvl += pool.stakedTvl;
          });

          try {
            await Promise.all([
              this.statsService.mappingIncetivizedPools(generalStats, prices),
            ]);
          } catch (error) {}

          generalStats.incentivizedPools.forEach((pool) => {
            if (!pool.t0Address) {
              generalStats.poolsTvl += pool.stakedTvl;
            }
            delete pool.abi;
          });

          this.logger.log(`finish calculate chainID ${chainId}`);
          break;
        case configuration().networksId.POLYGON:
          generalStats.farms = await this.fetchDualFarms(prices, chainId);
          delete generalStats.pools;
          delete generalStats.incentivizedPools;
          delete generalStats.poolsTvl;
          this.logger.log(`finish calculate chainID ${chainId}`);
          break;

        default:
          return {
            chainId,
            message: 'Network not supported',
          };
      }
      await this.cacheManager.set(
        `calculateStats-network-${chainId}`,
        generalStats,
        { ttl: 120 },
      );
      await this.createGeneralStats(generalStats, { chainId });
      return generalStats;
    } catch (e) {
      console.log(e);
      this.logger.error('Something went wrong calculating stats network');
      return e;
    }
  }

  async fetchDualFarms(tokenPrices, chainId: number) {
    const { data: response } = await this.httpService
      .get(this.DUAL_FARMS_LIST_URL)
      .toPromise();
    const miniChefAddress = masterApeContractAddressNetwork(chainId);
    const data: any[] = await Promise.all(
      response.map(async (dualFarmConfig) => {
        const lpAdress = dualFarmConfig.stakeTokenAddress;
        const quoteToken =
          tokenPrices[dualFarmConfig.stakeTokens.token0.address.toLowerCase()];
        const token1 =
          tokenPrices[dualFarmConfig.stakeTokens.token1.address.toLowerCase()];
        const miniChefRewarderToken =
          tokenPrices[dualFarmConfig.rewardTokens.token0.address.toLowerCase()];
        const rewarderToken =
          tokenPrices[dualFarmConfig.rewardTokens.token1.address.toLowerCase()];

        const calls = [
          // Balance of token in the LP contract
          {
            address: dualFarmConfig.stakeTokens.token0.address,
            name: 'balanceOf',
            params: [lpAdress],
          },
          // Balance of quote token on LP contract
          {
            address: dualFarmConfig.stakeTokens.token1.address,
            name: 'balanceOf',
            params: [lpAdress],
          },
          // Balance of LP tokens in the master chef contract
          {
            address: lpAdress,
            name: 'balanceOf',
            params: [miniChefAddress],
          },
          // Total supply of LP tokens
          {
            address: lpAdress,
            name: 'totalSupply',
          },
        ];

        const [
          quoteTokenBlanceLP,
          tokenBalanceLP,
          lpTokenBalanceMC,
          lpTotalSupply,
        ] = await multicallNetwork(erc20AbiNetwork(chainId), calls, chainId);

        // Ratio in % a LP tokens that are in staking, vs the total number in circulation
        const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(
          new BigNumber(lpTotalSupply),
        );

        // Total value in staking in quote token value
        const lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteToken?.decimals))
          .times(new BigNumber(2))
          .times(lpTokenRatio);

        // Total value in pool in quote token value
        const totalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteToken?.decimals))
          .times(new BigNumber(2));

        // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
        const tokenAmount = new BigNumber(tokenBalanceLP)
          .div(new BigNumber(10).pow(token1?.decimals))
          .times(lpTokenRatio);
        const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteToken?.decimals))
          .times(lpTokenRatio);

        let alloc = null;
        let multiplier = 'unset';
        let miniChefPoolRewardPerSecond = null;
        try {
          const [
            info,
            totalAllocPoint,
            miniChefRewardsPerSecond,
          ] = await multicallNetwork(
            masterApeAbiNetwork(chainId),
            [
              {
                address: miniChefAddress,
                name: 'poolInfo',
                params: [dualFarmConfig.pid],
              },
              {
                address: miniChefAddress,
                name: 'totalAllocPoint',
              },
              {
                address: miniChefAddress,
                name: 'bananaPerSecond',
              },
            ],
            chainId,
          );
          const allocPoint = new BigNumber(info.allocPoint._hex);
          const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint));
          miniChefPoolRewardPerSecond = getBalanceNumber(
            poolWeight.times(miniChefRewardsPerSecond),
            miniChefRewarderToken?.decimals,
          );
          alloc = poolWeight.toJSON();
          multiplier = `${allocPoint.div(100).toString()}X`;
          // eslint-disable-next-line no-empty
        } catch (error) {
          console.warn('Error fetching farm', error, dualFarmConfig);
        }

        let rewarderTotalAlloc = null;
        let rewarderInfo = null;
        let rewardsPerSecond = null;

        if (
          dualFarmConfig.rewarderAddress.toLowerCase() ===
          '0x1F234B1b83e21Cb5e2b99b4E498fe70Ef2d6e3bf'.toLowerCase()
        ) {
          // Temporary until we integrate the subgraph to the frontend
          rewarderTotalAlloc = 10000;
          const multiReturn = await multicallNetwork(
            MINI_COMPLEX_REWARDER_ABI,
            [
              {
                address: dualFarmConfig.rewarderAddress,
                name: 'poolInfo',
                params: [dualFarmConfig.pid],
              },
              {
                address: dualFarmConfig.rewarderAddress,
                name: 'rewardPerSecond',
              },
            ],
            chainId,
          );
          rewarderInfo = multiReturn[0];
          rewardsPerSecond = multiReturn[1];
        } else {
          const multiReturn = await multicallNetwork(
            MINI_COMPLEX_REWARDER_ABI,
            [
              {
                address: dualFarmConfig.rewarderAddress,
                name: 'poolInfo',
                params: [dualFarmConfig.pid],
              },
              {
                address: dualFarmConfig.rewarderAddress,
                name: 'rewardPerSecond',
              },
              {
                address: dualFarmConfig.rewarderAddress,
                name: 'totalAllocPoint',
              },
            ],
            chainId,
          );
          rewarderInfo = multiReturn[0];
          rewardsPerSecond = multiReturn[1];
          rewarderTotalAlloc = multiReturn[2];
        }

        const totalStaked = quoteTokenAmount
          .times(new BigNumber(2))
          .times(quoteToken?.usd);
        const totalValueInLp = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteToken?.decimals))
          .times(new BigNumber(2))
          .times(quoteToken?.usd);
        const stakeTokenPrice = totalValueInLp
          .div(new BigNumber(getBalanceNumber(lpTotalSupply)))
          .toNumber();

        const rewarderAllocPoint = new BigNumber(
          rewarderInfo?.allocPoint?._hex,
        );
        const rewarderPoolWeight = rewarderAllocPoint.div(
          new BigNumber(rewarderTotalAlloc),
        );
        const rewarderPoolRewardPerSecond = getBalanceNumber(
          rewarderPoolWeight.times(rewardsPerSecond),
          rewarderToken?.decimals,
        );
        const apr = getDualFarmApr(
          totalStaked?.toNumber(),
          miniChefRewarderToken?.usd,
          miniChefPoolRewardPerSecond?.toString(),
          rewarderToken?.usd,
          rewarderPoolRewardPerSecond?.toString(),
        );

        return {
          ...dualFarmConfig,
          tokenAmount: tokenAmount.toJSON(),
          totalStaked: totalStaked.toFixed(0),
          quoteTokenAmount: quoteTokenAmount.toJSON(),
          totalInQuoteToken: totalInQuoteToken.toJSON(),
          lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
          tokenPriceVsQuote: quoteTokenAmount.div(tokenAmount).toJSON(),
          stakeTokenPrice,
          rewardToken0Price: miniChefRewarderToken?.usd,
          rewardToken1Price: rewarderToken?.usd,
          poolWeight: alloc,
          multiplier,
          apr,
        };
      }),
    );
    return data;
  }
}
