import { BEP20_REWARD_APE_ABI } from 'src/stats/utils/abi/bep20RewardApeAbi';

export const burningPools = [
  {
    sousId: 1,
    name: 'GNANA -> BANANA Reward Pool',
    address: '0x7c625d49CCDEC6c6Fb0611f388Aa64d6A2626876',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    rewardPerBlock: 138888888888888,
    startBlock: 10405985,
    bonusEndBlock: 10413185,
    abi: BEP20_REWARD_APE_ABI,
  },
  {
    sousId: 2,
    name: 'GNANA -> BANANA Reward Pool',
    address: '0x922fb8fEDd34A777F596122830423059594dfb32',
    stakeToken: '0xddb3bd8645775f59496c821e4f55a7ea6a6dc299',
    stakeTokenIsLp: false,
    rewardToken: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    rewardPerBlock: 138888888888888,
    startBlock: 10405946,
    bonusEndBlock: 10413146,
    abi: BEP20_REWARD_APE_ABI,
  },
];
