export default () => ({
  mongo_uri: process.env.MONGO_URL,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    lottery: {
      address: '0xF06557e0a4C0aBe314035cB196141Ca303Cb91D0',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0xAf1B22cBDbB502B2089885bcd230255f8B80243b',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      bnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      bananaBnb: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
      burn: '0x000000000000000000000000000000000000dead',
    },
    appNodes: [
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
    ],
  },
  56: {
    lottery: {
      address: '0xF06557e0a4C0aBe314035cB196141Ca303Cb91D0',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      bnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      bananaBnb: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
      burn: '0x000000000000000000000000000000000000dead',
    },
    appNodes: [
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed1.binance.org:443',
    ],
  },
});
