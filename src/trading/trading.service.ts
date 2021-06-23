import {
  Injectable,
  Logger,
  Inject,
  CACHE_MANAGER,
  HttpService,
} from '@nestjs/common';
import { Client } from 'pg';
import { Cache } from 'cache-manager';
import { ExportToCsv } from 'export-to-csv';
import fs from 'fs';
import { SeasonInfoDto, TradingAllInfoDto } from './dto/tradingAllInfo.dto';
@Injectable()
export class TradingService {
  logger = new Logger(TradingService.name);
  client = new Client(process.env.POSTGRES_URL);
  apeswapStrapiUrl = process.env.APESWAP_STRAPI_URL;
  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.client.connect((err) => {
      if (err) {
        console.error('connection error', err.stack);
      } else {
        console.log('connected');
      }
    });
  }

  getCurrentTimestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  async getPairLeaderBoard(season: number, pair: string, address?: string) {
    const seasonInfo = await this.getPairInformation(pair, season);

    const trading = await this.getTrading(
      season,
      pair,
      seasonInfo.startTimestamp,
      seasonInfo.endTimestamp,
      seasonInfo.rewards,
    );
    const individual = this.calculateIndividualStats(
      seasonInfo,
      trading,
      address,
    );
    const allInfo: TradingAllInfoDto = {
      season: seasonInfo,
      individual: individual,
      trading: trading,
    };
    return allInfo;
  }

  async tradingExportSeason(pair, season) {
    const seasonInfo = await this.getPairInformation(pair, season, true);
    if (!seasonInfo?.startTimestamp || !seasonInfo?.endTimestamp) return [];

    const endTimestamp = this.calculateEndTime(seasonInfo.endTimestamp);
    const trading = await this.executeQuery(
      pair,
      seasonInfo.startTimestamp,
      endTimestamp,
      seasonInfo.rewards,
    );

    const csv = [];
    let amount = 0;
    for (let index = 0; index < trading.length; index++) {
      const element = trading[index];
      csv.push({
        address: element.user,
        totalTradedUsd: element.volume,
        pendingBananaRewards: element.prize,
      });
      amount += Number(element.volume);
    }
    const startTime = new Date(Number(seasonInfo.startTimestamp) * 1000);
    const endTime = new Date(Number(endTimestamp) * 1000);
    const extraData = [
      {
        address: 'Token: ',
        totalTradedUsd: seasonInfo.name || seasonInfo.pair,
        pendingBananaRewards: '',
      },
      {
        address: 'Date: ',
        totalTradedUsd: `${startTime.toUTCString()} to ${endTime.toUTCString()}`,
        pendingBananaRewards: '',
      },
      {
        address: 'Total Amount Trade: ',
        totalTradedUsd: amount,
        pendingBananaRewards: '',
      },
      {
        address: '',
        totalTradedUsd: '',
        pendingBananaRewards: '',
      },
    ];
    const csvExporter = new ExportToCsv();
    const csvData = csvExporter.generateCsv([...extraData, ...csv], true);
    const pathfile = `${season}-${pair}.csv`;
    fs.writeFileSync(pathfile, csvData);
    return pathfile;
  }
  async getTrading(season, pair, startTimestamp, endTimestamp, reward) {
    let trading = await this.cacheManager.get(`trading-${season}-${pair}`);
    if (!trading) {
      trading = await this.executeQuery(
        pair,
        startTimestamp,
        endTimestamp,
        reward,
      );
      await this.cacheManager.set(`trading-${season}-${pair}`, trading, {
        ttl: 660,
      });
    }
    return trading;
  }

  async executeQuery(pair, startTimestamp, endTimestamp, reward) {
    try {
      const sql = `SELECT user_pair_day_data.user, sum(daily_volume_usd) volume, sum(daily_volume_usd)/$1 prize 
      FROM sgd1.user_pair_day_data 
      WHERE pair  = $4 AND "date"  > $2 AND "date" <= $3
      AND block_range @> 999999999 
      GROUP BY user_pair_day_data.user ORDER BY sum(daily_volume_usd) DESC`;
      const query = await this.client.query(sql, [
        reward,
        startTimestamp,
        endTimestamp,
        pair,
      ]);
      return query.rows;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  calculateIndividualStats(seasonInfo, allInfo, address) {
    const individual = {
      address,
      volume: 0,
      prize: 0,
      position: 0,
    };
    if (allInfo.length == 0) return individual;
    const lowerAddress = address.toLowerCase();

    const position = allInfo.findIndex((el) => el.user === lowerAddress);
    individual.position = allInfo.length + 1;
    if (position !== -1) {
      const volume = parseFloat(allInfo[position].volume);
      const rewards = volume / seasonInfo.rewards;
      individual.volume = volume;
      individual.prize = rewards;
      individual.position = position + 1;
    }

    return individual;
  }

  calculateEndTime(endTimestamp) {
    const currentTime = this.getCurrentTimestamp();
    if (currentTime > endTimestamp) return endTimestamp;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayUTC = Date.UTC(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      23,
      59,
      59,
    );
    return Math.floor(yesterdayUTC / 1000);
  }

  async getPairInformation(pair, season, withoutCache = false) {
    const cachedValue = await this.cacheManager.get(`info-${season}-${pair}`);
    if (!withoutCache && cachedValue) {
      this.logger.log('Hit Pair Information cache');
      return cachedValue as SeasonInfoDto;
    }

    const url = `${this.apeswapStrapiUrl}/tradings?pair=${pair}&season=${season}`;
    const { data } = await this.httpService.get(url).toPromise();
    if (data.length > 0)
      await this.cacheManager.set(`info-${season}-${pair}`, data[0], {
        ttl: 660,
      });

    return data.length > 0
      ? (data[0] as SeasonInfoDto)
      : { startTimestamp: null, endTimestamp: null };
  }
}
