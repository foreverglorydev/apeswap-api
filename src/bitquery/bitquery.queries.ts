export const QUOTE_CURRENCY_BUSD = '0x55d398326f99059ff775485246999027b3197955';
export const QUOTE_CURRENCY_USDT = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';

export function queryPairInformation(
    address: string,
    network: string,
    from: string,
    till: string
) {
    return `{
        ethereum(network: ${network}) {
            smartContractCalls(
              options: {desc: "count", limit: 10, offset: 0}
          date: {since: "${from}", till: "${till}"}
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
  }}`
}

export function queryPoolBalances(
    address: string, 
    currencyAddress: string, 
    network: string, 
    quoteCurrency: string
) {
    return  `{
        ethereum(network: ${network}) {
          address(address: {is: "${address}"}) {
            balances(currency: {is: "${currencyAddress}"}) {
              currency {
                symbol
                address
              }
              value
            }
          }
        dexTrades(
            baseCurrency: {is: "${currencyAddress}"}
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
      `
}
export const tokenInformation =
  `query($baseCurrency : String!, $quoteCurrency : String!){
        ethereum(network: bsc) {
          transfers(date: {since: null, till: null}, amount: {gt: 0}) {
            minted: amount(
              calculate: sum
            sender: {in: [\"0x0000000000000000000000000000000000000000\",\"0x0000000000000000000000000000000000000001\"]}
        )
        burned: amount(
              calculate: sum
            receiver: {in: [\"0x0000000000000000000000000000000000000000\", \"0x0000000000000000000000000000000000000001\", \"0x000000000000000000000000000000000000dead\"]}
        )
        currency(currency: {is: $baseCurrency}) {
              symbol
            name
      }
    }
      dexTrades(
            baseCurrency: {is: $baseCurrency}
          quoteCurrency: {is: $quoteCurrency}
          options: {desc: [\"block.height\", \"transaction.index\"], limit: 1}
      ) {
            block {
              height
            timestamp {
                time(format: \"%Y-%m-%d %H:%M:%S\")
        }
      }
        transaction {
              index
      }
        quotePrice
    }
  }
}`;