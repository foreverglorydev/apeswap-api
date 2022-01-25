import { Module, DynamicModule, HttpModule, HttpService } from '@nestjs/common';
import { BitqueryService } from './bitquery.service';

export interface Config {
  url: string;
  apiKey: string;
}

@Module({
    providers: [BitqueryService],
    exports: [BitqueryService],
})
export class BitqueryModule {
  static forRoot(options: Config): DynamicModule {
    return {
      module: BitqueryModule,
      providers: [
        {
          provide: BitqueryService,
          useValue: new BitqueryService(options, new HttpService)
        }
      ],
      exports: [
        BitqueryService
      ],
      imports: [
          HttpModule
      ]
    };
  }
}