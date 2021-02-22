import { Injectable } from '@nestjs/common';
import { LOTTERY_CONTRACT } from 'src/utils/constants';
import { ceilDecimal } from 'src/utils/math';
import { generateLotteryDate } from './utils/lottery.date';
import {
  computeLotteries,
  getAllLotteries,
  getIssueIndex,
  getRates,
  getSingleLotteryBatch,
  getTicketPrice,
  Lottery,
  LotteryHistory,
  SingleLottery,
  SingleLotteryReturn,
} from './utils/lottery.utils';

@Injectable()
export class LotteryService {
  async getLottery(
    lotteryNumber: number,
  ): Promise<
    | SingleLottery
    | {
        error?: string;
        errorMessage?: string;
        maxLotteryNumber?: number;
      }
  > {
    const issueIndex = await getIssueIndex();
    if (typeof issueIndex !== 'number') {
      return issueIndex;
    }
    //Check if lotteryNumber is out of range (small 0 or bigger last Lottery (Drawn))
    if (lotteryNumber < 0 || lotteryNumber > issueIndex) {
      return {
        error: 'lotteryNumber out of range',
        errorMessage: `The LotteryNumber you provided is does not exists`,
        maxLotteryNumber: issueIndex,
      };
    }
    const {
      numbers1: numbers1Prom,
      numbers2: numbers2Prom,
    } = getSingleLotteryBatch(lotteryNumber);
    const numbers1 = await numbers1Prom;
    const numbers2Res = await numbers2Prom;
    const numbers2: Array<number> = numbers2Res.map((n) => parseInt(n) / 1e18);

    const lotteryDate = generateLotteryDate(lotteryNumber);
    const ratesToUse = getRates(lotteryNumber);
    const ticketPrice = getTicketPrice(lotteryNumber);
    const poolSize = numbers2[0];
    const lottery: SingleLottery = {
      lotteryNumber,
      lotteryDate,
      lotteryNumbers: numbers1.map((x) => Number(x)),
      poolSize: ceilDecimal(poolSize, 2),
      burned: ceilDecimal((poolSize / 100) * ratesToUse.burn, 2),
      contractLink: `https://bscscan.com/address/${LOTTERY_CONTRACT}`,
      jackpotTicket: numbers2[1] / ticketPrice,
      match3Ticket: numbers2[2] / ticketPrice,
      match2Ticket: numbers2[3] / ticketPrice,
      match1Ticket: numbers2[4] ? numbers2[4] / ticketPrice : null,
      poolJackpot: ceilDecimal((poolSize / 100) * ratesToUse.jackpot, 2),
      poolMatch3: ceilDecimal((poolSize / 100) * ratesToUse.match3, 2),
      poolMatch2: ceilDecimal((poolSize / 100) * ratesToUse.match2, 2),
      poolMatch1: ratesToUse.match1
        ? ceilDecimal((poolSize / 100) * ratesToUse.match1, 2)
        : null,
    };
    return lottery;
  }
  async getLotteries(
    pageSize?: number,
    page = 0,
  ): Promise<{
    totalPage?: number;
    totalItems?: number;
    lotteries?: Array<Lottery>;
    currentPage?: number;
    error?: string;
    errorMessage?: string;
  }> {
    const issueIndex = await getIssueIndex();
    if (typeof issueIndex !== 'number') {
      return issueIndex;
    }

    const finalNumbersProm: Array<SingleLotteryReturn> = [];
    const totalPage = pageSize ? Math.ceil(issueIndex / pageSize - 1) : 0;

    if (typeof pageSize !== 'undefined') {
      if (pageSize * page > issueIndex) {
        return {
          error: 'page out of range',
          errorMessage: `The requested page with the requested pageSize is out of range. The last page is: ${totalPage}`,
          totalPage,
          totalItems: issueIndex,
        };
      }

      const offset = page * pageSize;
      const start = issueIndex - (offset + 1);
      const end = start - pageSize;

      for (let i = start; i >= 0 && i > end; i--) {
        if (i !== 349) {
          finalNumbersProm.push(getSingleLotteryBatch(i));
        }
      }
    } else {
      for (let i = issueIndex; i >= 0; i--) {
        if (i !== 349) {
          finalNumbersProm.push(getSingleLotteryBatch(i));
        }
      }
    }
    const finalNumbers = await computeLotteries(finalNumbersProm);

    return {
      totalPage: totalPage,
      totalItems: issueIndex,
      lotteries: finalNumbers,
      currentPage: page,
    };
  }

  async getLotteryHistory(): Promise<
    | Array<LotteryHistory>
    | {
        error?: string;
        errorMessage?: string;
        maxLotteryNumber?: number;
      }
  > {
    const issueIndex = await getIssueIndex();
    if (typeof issueIndex !== 'number') {
      throw new Error('IssueIndex not a number');
    }
    console.log(issueIndex);
    const allLotteries = await getAllLotteries(issueIndex - 1);
    const history: Array<LotteryHistory> = allLotteries.map(
      (x): LotteryHistory => {
        return {
          lotteryNumber: x.issueIndex,
          poolSize: ceilDecimal(x.numbers2[0], 2),
          burned: ceilDecimal(
            (x.numbers2[0] / 100) * getRates(x.issueIndex).burn,
            2,
          ),
        };
      },
    );
    return history;
  }
}
