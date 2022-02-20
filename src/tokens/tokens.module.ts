import { CacheModule, Module, HttpModule } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { SubgraphService } from '../stats/subgraph.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenList, TokenListSchema } from './schema/tokenList.schema';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
    MongooseModule.forFeature([
      { name: TokenList.name, schema: TokenListSchema },
    ]),
  ],
  providers: [TokensService, SubgraphService],
  exports: [],
  controllers: [TokensController],
})
export class TokensModule {}
