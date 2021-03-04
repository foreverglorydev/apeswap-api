export default () => ({
  mongo_uri: process.env.MONGO_URL,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    lottery: {
      address: '0xbcbcfF994AF1f5B1F51D68A7322C86be18243b5B',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0xAf1B22cBDbB502B2089885bcd230255f8B80243b',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
    },
    appNodes: [
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
    ],
  },
  56: {
    lottery: {
      address: '0xbcbcfF994AF1f5B1F51D68A7322C86be18243b5B',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
    },
    appNodes: [
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed1.binance.org:443',
    ],
  },
});
