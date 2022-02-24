import { ERC20_ABI } from 'src/stats/utils/abi/erc20Abi';
import { ERC20_ABI_POLYGON } from 'src/stats/utils/abi/erc20AbiPolygon';
import { LP_ABI } from 'src/stats/utils/abi/lpAbi';
import { LP_ABI_POLYGON } from 'src/stats/utils/abi/lpAbiPolygon';
import { MASTER_APE_ABI } from 'src/stats/utils/abi/masterApeAbi';
import { MASTER_APE_ABI_POLYGON } from 'src/stats/utils/abi/masterApeAbiPolygon';
import { MULTICALL_ABI } from 'src/utils/lib/abi/multicallAbi';
import { MULTICALL_ABI_POLYGON } from 'src/utils/lib/abi/multicallAbiPolygon';

export default () => ({
  mongo_uri: process.env.MONGO_URL,
  environment: process.env.NODE_ENV,
  chainId: process.env.CHAIN_ID || 97,
  networksId: {
    BSC: 56,
    POLYGON: 137,
  },
  97: {
    lottery: {
      address: '0xe42Ff4758C37ccC3A54004b176384477bbBe70D6',
      adminAddress: '0xb5e1Ec9861D7c1C99cB3d79dd602cC6122F0d7dc',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0xAf1B22cBDbB502B2089885bcd230255f8B80243b',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      goldenBanana: '0x9407026d236deae22cc1f3c419a9e47cbfcfe9e5',
      bnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      bananaBnb: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
      burn: '0x000000000000000000000000000000000000dead',
      mulltiCall: '0x67ADCB4dF3931b0C5Da724058ADC2174a9844412',
      auction: '0x80a01f81b92d21e39ff1276c4a81d25cb4dc4cdb',
      gBananaTreasury: '0xec4b9d1fd8a3534e31fce1636c7479bcd29213ae',
    },
    appNodes: [
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
    ],
    iazoExposer: '0xe977E40f29f699F75db2A137Af0B3Db2152404b6',
  },
  56: {
    lottery: {
      address: '0x451bCf562A4d747da3455bBAFACe988d56dA6D83',
      adminAddress: '0xCaE366497aC10De7f1faeBBf496E7dBD7764C6b3',
      adminKey: process.env.LOTTERY_ADMIN_KEY,
    },
    contracts: {
      masterApe: '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9',
      banana: '0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95',
      goldenBanana: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
      bnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      bananaBusd: '0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914',
      bananaBnb: '0xF65C1C0478eFDe3c19b49EcBE7ACc57BB6B1D713',
      burn: '0x000000000000000000000000000000000000dead',
      mulltiCall: '0x38ce767d81de3940CFa5020B55af1A400ED4F657',
      gBananaTreasury: '0xec4b9d1fd8a3534e31fce1636c7479bcd29213ae',
      auction: '0xaeCB396Be7F19618Db4C44d8e2E8C908228515E9',
    },
    apePriceGetter: '0x5e545322b83626c745FE46144a15C00C94cBD803',
    appNodes: [
      'https://bsc-dataseed.binance.org:443',
      'https://bsc-dataseed1.defibit.io:443',
      'https://bsc-dataseed1.ninicoin.io:443',
      /* 'https://bsc-dataseed2.ninicoin.io:443',
      'https://bsc-dataseed3.ninicoin.io:443',
      'https://bsc-dataseed4.ninicoin.io:443',
      'https://bsc-dataseed2.defibit.io:443',
      'https://bsc-dataseed3.defibit.io:443',
      'https://bsc-dataseed4.defibit.io:443',
      'https://bsc-dataseed1.binance.org:443',
      'https://bsc-dataseed2.binance.org:443',
      'https://bsc-dataseed3.binance.org:443',
      'https://bsc-dataseed4.binance.org:443', */
    ],
    iazoExposer: '0xFdfb230bFa399EC32EA8e98c2E7E3CcD953C860A',
    lending: '0xCc7aaC69015a7645dfC39ddEB5902ca9FC0Bc15C',
    unitroller: '0xAD48B2C9DC6709a560018c678e918253a65df86e',
    abi: {
      masterApe: MASTER_APE_ABI,
      multiCall: MULTICALL_ABI,
      lp: LP_ABI,
      erc20: ERC20_ABI,
    },
  },
  137: {
    contracts: {
      masterApe: '0x54aff400858Dcac39797a81894D9920f16972D1D',
      mulltiCall: '0x95028E5B8a734bb7E2071F96De89BABe75be9C8E',
      banana: '0x5d47baba0d66083c52009271faf3f50dcc01023c',
      burn: '0x000000000000000000000000000000000000dead',
    },
    apePriceGetter: '0x05D6C73D7de6E02B3f57677f849843c03320681c',
    appNodes: [
      'https://polygon-rpc.com',
      //'https://rpc-mainnet.matic.network',
      //'https://matic-mainnet.chainstacklabs.com',
      //'https://rpc-mainnet.maticvigil.com',
      //'https://rpc-mainnet.matic.quiknode.pro',
      //'https://matic-mainnet-full-rpc.bwarelabs.com',
    ],
    abi: {
      masterApe: MASTER_APE_ABI_POLYGON,
      multiCall: MULTICALL_ABI_POLYGON,
      lp: LP_ABI_POLYGON,
      erc20: ERC20_ABI_POLYGON,
    },
  },
});
