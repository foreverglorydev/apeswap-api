// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// BEP-20 addresses.
export const BANANA = process.env.BANANA_ADDRESS as string;
export const DEAD = '0x000000000000000000000000000000000000dEaD';

// Contract addresses.
export const LOTTERY_CONTRACT = process.env.LOTTERY_ADDRESS as string;

export const BSC_NODE_RPC = [
  process.env.APP_NODE_1,
  process.env.APP_NODE_2,
  process.env.APP_NODE_3,
] as Array<string>;
