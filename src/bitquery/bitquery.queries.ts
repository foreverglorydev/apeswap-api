import { CandleOptionsDto } from './dto/candle.dto';

export const QUOTE_CURRENCY_BSC = {
  USDT: '0x55d398326f99059ff775485246999027b3197955',
  BUSD: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
};
export const QUOTE_CURRENCY_MATIC = {
  USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
};

export function queryPairInformation(address: string, network: string) {
  return `{
        ethereum(network: ${network}) {
            smartContractCalls(
              options: {desc: "count", limit: 10, offset: 0}
          date: {since: null, till: null}
          caller: {is: "${address}"}
        ) {
              smartContract {
                address {
                  address
                  annotation
            }
            contractType
            currency {
                  name
                  symbol
            }
      }
          max_date: maximum(of: date)
          count
          uniq_methods: count(uniq: smart_contract_methods)
          gasValue(calculate: average)
    }
  }}`;
}

export function queryPoolBalances(
  addressLP: string,
  network: string,
  baseAddress: string,
  targetAddress: string,
  quoteCurrency: string,
) {
  return `{
        ethereum(network: ${network}) {
          address(address: {is: "${addressLP}"}) {
            balances(currency: {in: ["${baseAddress}","${targetAddress}"]}) {
              currency {
                symbol
                address
              }
              value
            }
          }
        base: dexTrades(
            baseCurrency: {is: "${baseAddress}"}
            quoteCurrency: {is: "${quoteCurrency}"}
            options: {desc: ["block.height", "transaction.index"], limit: 1}
          ) {
            block {
              height
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
            }
            transaction {
              index
            }
            quotePrice
            }
        target: dexTrades(
            baseCurrency: {is: "${targetAddress}"}
            quoteCurrency: {is: "${quoteCurrency}"}
            options: {desc: ["block.height", "transaction.index"], limit: 1}
          ) {
            block {
              height
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
            }
            transaction {
              index
            }
            quotePrice
            }
          }
      }
      `;
}
export function queryTokenInformation(
  network: string,
  baseCurrency: string,
  quoteCurrency: string,
) {
  return `{
        ethereum(network: ${network}) {
          transfers(date: {since: null, till: null}, amount: {gt: 0}) {
            minted: amount(
              calculate: sum
            sender: {in: ["0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000001"]}
        )
        burned: amount(
              calculate: sum
            receiver: {in: ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000001", "0x000000000000000000000000000000000000dead"]}
        )
        currency(currency: {is: "${baseCurrency}"}) {
              symbol
            name
      }
    }
      dexTrades(
            baseCurrency: {is: "${baseCurrency}"}
          quoteCurrency: {is: "${quoteCurrency}"}
          options: {desc: ["block.height", "transaction.index"], limit: 1}
      ) {
            block {
              height
            timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
        }
      }
        transaction {
              index
      }
        quotePrice
    }
  }
}`;
}

export function queryCandleData(
  baseCurrency: string,
  quoteCurrency: string,
  network: string,
  options: CandleOptionsDto,
) {
  const { from: since, to: till, minTrade, interval: window } = options;
  return `{
        ethereum(network: ${network}) {
          dexTrades(
            options: {asc: "timeInterval.minute"}
            date: {since: "${since}", till: "${till}"}
            baseCurrency: {is: "${baseCurrency}"}
            quoteCurrency: {is: "${quoteCurrency}"}
            tradeAmountUsd: {gt: ${minTrade}}
            exchangeName: {is: "ApeSwap"}
          ) {
            timeInterval {
              minute(count: ${window}, format: "%Y-%m-%dT%H:%M:%SZ")
            }
            baseCurrency {
              symbol
              address
            }
            quoteCurrency {
              symbol
              address
            }
            tradeAmount(in: USD)
            trades: count
            quotePrice
            maximum_price: quotePrice(calculate: maximum)
            minimum_price: quotePrice(calculate: minimum)
            open_price: minimum(of: block, get: quote_price)
            close_price: maximum(of: block, get: quote_price)
          }
        }
      }`;
}

export function queryTreasuryGnana(address: string) {
  return `{
    ethereum(network: bsc) {
      address(address: {is: "${address}"}) {
        smartContract {
          attributes {
            name
            type
            address {
              address
              annotation
            }
            value
          }
        }
      }
    }
  }
  `;
}
