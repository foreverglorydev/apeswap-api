export function swap(pairAddress: string) {
  return `{
        ethereum(network: bsc) {
          smartContractEvents(
            options: {desc: "block.height", limit: 10}
            smartContractEvent: {is: "Swap"}
            smartContractAddress: {is: "${pairAddress}"}
          ) {
            transaction {
              hash
            }
            block {
              height
              timestamp {
                iso8601
                unixtime
              }
            }
            eventIndex
            arguments {
              value
              argument
            }
          }
        }
      }`;
}

export function newPool(factoryAddress: string) {
  return `{
    ethereum(network: bsc) {
          arguments(smartContractAddress: {is: "${factoryAddress}"}, smartContractEvent: {is: "PairCreated"}, options: {desc: "block.height", limit: 3}) {
            block {
              height
            }
            argument {
              name
            }
            reference {
              address
            }
          }
        }
      }`;
}

export function poolBalance(poolAddress: string) {
  return `{
    ethereum(network: bsc) {
      address(address: {is: "${poolAddress}"}) {
        balances {
          currency {
            symbol
          }
          value
        }
      }
    }
  }`;
}
