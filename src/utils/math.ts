import BigNumber from 'bignumber.js';

export const ceilDecimal = (value: number, decimal = 0): number => {
  let multiplier = 1;
  if (decimal > 0) {
    multiplier = Math.pow(10, decimal);
  }
  return Math.ceil(value * multiplier) / multiplier;
};

export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
  const displayBalance = new BigNumber(balance).dividedBy(
    new BigNumber(10).pow(decimals),
  );
  return displayBalance.toNumber();
};
