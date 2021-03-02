export default () => ({
  mongo_uri: process.env.MONGO_URL,
  chainId: process.env.CHAIN_ID || 97,
  97: {
    lottery: {
      address: '0xbcbcfF994AF1f5B1F51D68A7322C86be18243b5B',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    masterChef: {
      address: '0xAf1B22cBDbB502B2089885bcd230255f8B80243b',
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
    masterChef: {
      address: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
    },
    appNodes: [
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed1.binance.org:443',
    ],
  },
});
