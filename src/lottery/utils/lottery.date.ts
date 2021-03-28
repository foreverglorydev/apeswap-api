export const firstLottery = new Date(Date.UTC(2021, 3, 30, 2, 0, 0, 0)); // Time of the first Offical Lottery; There are 3 Tests lotteries
export const numberOfTestLotteries = 3;
const hour = 60 * 60 * 1000;
export const generateLotteryDate = (issueIndex: number): Date => {
  const lotteryDate = new Date(firstLottery);
  lotteryDate.setTime(
    lotteryDate.getTime() + (issueIndex - numberOfTestLotteries) * 24 * hour,
  );
  return lotteryDate;
};
