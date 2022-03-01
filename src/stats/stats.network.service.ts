import {
  Injectable,
  HttpService,
  Inject,
  CACHE_MANAGER,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { InjectModel } from '@nestjs/mongoose';
import { GeneralStatsNetworkDto } from 'src/interfaces/stats/generalStats.dto';
import { Cache } from 'cache-manager';
import { PriceService } from './price.service';
import { multicallNetwork } from 'src/utils/lib/multicall';
import { getPoolPrices, getDualFarmApr, arrayChunk } from './utils/stats.utils';
import { Model } from 'mongoose';
import { getBalanceNumber } from 'src/utils/math';
import { MINI_COMPLEX_REWARDER_ABI } from './utils/abi/miniComplexRewarderAbi';
import {
  GeneralStatsNetwork,
  GeneralStatsNetworkDocument,
} from './schema/generalStatsNetwork.schema';
import { StatsService } from './stats.service';
import { createLpPairName } from 'src/utils/helpers';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { getContractNetwork } from 'src/utils/lib/web3';
import { BitqueryService } from 'src/bitquery/bitquery.service';

@Injectable()
export class StatsNetworkService {
  private readonly logger = new Logger(StatsNetworkService.name);
  private readonly DUAL_FARMS_LIST_URL = this.configService.getData<string>(
    'dualFarmsListUrl',
  );

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    @InjectModel(GeneralStatsNetwork.name)
    private generalStatsNetworkModel: Model<GeneralStatsNetworkDocument>,
    private priceService: PriceService,
    private statsService: StatsService,
    private configService: ChainConfigService,
    private bitqueryService: BitqueryService,
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
      return cachedValue as GeneralStatsNetworkDto;
    }
    const infoStats = await this.verifyStats(chainId);
    if (infoStats) return infoStats;
    await this.updateCreatedAtStats({ chainId });
    this.getStatsNetwork(chainId);
    const generalStats: any = await this.findGeneralStats({ chainId });
    return generalStats;
  }

  async getStatsNetwork(chainId: number): Promise<GeneralStatsNetworkDto> {
    try {
      const masterApeContract = getContractNetwork(
        this.configService.getData<string>(`${chainId}.abi.masterApe`),
        this.configService.getData<string>(`${chainId}.contracts.masterApe`),
        chainId,
      );

      const [
        prices,
        { burntAmount, totalSupply, circulatingSupply },
      ] = await Promise.all([
        this.priceService.getTokenPricesv2(chainId),
        this.statsService.getBurnAndSupply(chainId),
      ]);
      const priceUSD =
        prices[
          this.configService.getData<string>(`${chainId}.contracts.banana`)
        ].usd;
      const generalStats: GeneralStatsNetworkDto = {
        chainId,
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
      // const a: string[] = [
      //   "0x034293F21F1cCE5908BC605CE5850dF2b1059aC0",
      //   "0x6Cf8654e85AB489cA7e70189046D507ebA233613",
      //   "0xd32f3139A214034A0f9777c87eE0a064c1FF6AE2",
      //   "0x65D43B64E3B31965Cd5EA367D4c2b94c03084797",
      //   "0xe82635a105c520fd58e597181cBf754961d51E3e",
      //   "0x5b13B583D4317aB15186Ed660A1E4C65C10da659",
      //   "0x0359001070cF696D5993E0697335157a6f7dB289",
      //   "0xB8e54c9Ea1616beEBe11505a419DD8dF1000E02a",
      //   "0xf67DE5Cf1fB01DC4df842a846Df2a7Ec07c41b93",
      //   "0xb01bAf15079eE93590A862Df37234e8f7C9825bF",
      //   "0xcBf71C04148e5C463223F07A64a50f2Df46B6cdc",
      //   "0x2735d319739edc6c47c3a20aa5402b931c3f1a1e",
      //   "0x0806a407d6eea72788d91c36829a19d424446040"
      // ];
      // const { volumes } = await this.bitqueryService.getDailyLPVolume('matic', a)
      // return generalStats;
      switch (chainId) {
        case this.configService.getData<number>('networksId.BSC'):
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
                this.configService.getData<string>(
                  `${chainId}.contracts.banana`,
                ),
              );
            }
          }

          generalStats.pools.forEach((pool) => {
            generalStats.poolsTvl += pool.stakedTvl;
          });

          try {
            await Promise.all([
              this.statsService.mappingIncetivizedPools(generalStats, prices),
              this.mappingLPVolume(
                'bsc',
                generalStats,
                this.configService.getData<number>(`${chainId}.feeLP`),
              ),
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
        case this.configService.getData<number>('networksId.POLYGON'):
          generalStats.farms = await this.fetchDualFarms(prices, chainId);
          await this.mappingLPVolume(
            'matic',
            generalStats,
            this.configService.getData<number>(`${chainId}.feeLP`),
          );
          delete generalStats.pools;
          delete generalStats.incentivizedPools;
          delete generalStats.poolsTvl;
          this.logger.log(`finish calculate chainID ${chainId}`);
          break;

        default:
          throw new BadRequestException('Network not supported');
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
    const miniChefAddress = this.configService.getData<string>(
      `${chainId}.contracts.masterApe`,
    );
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
        ] = await multicallNetwork(
          this.configService.getData<any>(`${chainId}.abi.erc20`),
          calls,
          chainId,
        );

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
            this.configService.getData<any>(`${chainId}.abi.masterApe`),
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
          poolIndex: dualFarmConfig.pid,
          name: createLpPairName(
            dualFarmConfig.stakeTokens.token0.symbol,
            dualFarmConfig.stakeTokens.token1.symbol,
          ),
          address: dualFarmConfig.stakeTokenAddress,
          t0Address: dualFarmConfig.stakeTokens.token0.address,
          t0Symbol: dualFarmConfig.stakeTokens.token0.symbol,
          t0Decimals: dualFarmConfig.stakeTokens.token0.decimals,
          p0: quoteToken.usd,
          q0: tokenAmount.toJSON(),
          t1Address: dualFarmConfig.stakeTokens.token1.address,
          t1Symbol: dualFarmConfig.stakeTokens.token1.symbol,
          t1Decimals: dualFarmConfig.stakeTokens.token1.decimals,
          p1: token1.usd,
          q1: quoteTokenAmount.toJSON(),
          price: stakeTokenPrice,
          totalSupply: totalInQuoteToken.toJSON(),
          tvl: totalStaked.toFixed(0),
          stakedTvl: lpTotalInQuoteToken.toJSON(),
          apr,
          rewardTokenPrice: miniChefRewarderToken?.usd,
          rewardTokenSymbol: miniChefRewarderToken?.symbol,
          decimals: miniChefRewarderToken?.decimals,
          rewardTokenPrice1: rewarderToken?.usd,
          rewardTokenSymbol1: rewarderToken?.symbol,
          decimals1: rewarderToken?.decimals,
          multiplier,
          poolWeight: alloc,
        };
      }),
    );
    return data;
  }

  async mappingLPVolume(
    network: string,
    pools: GeneralStatsNetworkDto,
    fee: number,
  ) {
    const addresses = pools.farms.map((f) => f.address);
    const listAddresses = arrayChunk(addresses);
    for (let index = 0; index < listAddresses.length; index++) {
      const list = listAddresses[index];
      const { volumes } = await this.bitqueryService.getDailyLPVolume(
        network,
        list,
      );
      pools.farms.forEach((f) => {
        const volume = volumes.find(
          (v) =>
            v.smartContract.address.address.toLowerCase() ===
            f.address.toLowerCase(),
        );
        if (volume) {
          const aprLpReward =
            (((volume.tradeAmount * fee) / 100) * 365) / +f.tvl;
          f.lpRewards = {
            volume: volume.tradeAmount,
            apr: aprLpReward,
          };
        }
      });
    }
  }
}
