export const QUOTE_CURRENCY_BUSD = '0x55d398326f99059ff775485246999027b3197955';
export const QUOTE_CURRENCY_MATIC = {
    USDT: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
};

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
    addressLP: string, 
    network: string, 
    baseAddress: string, 
    targetAddress: string, 
    quoteCurrency: string
) {
    return  `{
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
      `
}
export function queryTokenInformation(network:string, baseCurrency: string, quoteCurrency: string) {
  
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