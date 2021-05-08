export function tradeData(
  skip: number,
  pair: string,
  startTime: number,
  endTime: number,
) {
  return `{
    swaps(skip: ${skip}, first: 1000, orderBy: timestamp, where: {pair: ${pair}, timestamp_gt: ${startTime}, timestamp_lt: ${endTime}}) {
        id
        sender
        timestamp
        to
        amountUSD
        from
        pair{
            id
                token0{
            symbol
            }
            token1 {
            symbol
            }
        }
        }
    }`;
}
