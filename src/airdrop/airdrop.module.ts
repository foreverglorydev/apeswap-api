import { Module } from '@nestjs/common';
import { ChainConfigService } from 'src/config/chain.configuration.service';
import { AirdropService } from './airdrop.service';

@Module({
  imports: [AirdropModule],
  providers: [AirdropService],
  exports: [AirdropService, ChainConfigService],
})
export class AirdropModule {}
