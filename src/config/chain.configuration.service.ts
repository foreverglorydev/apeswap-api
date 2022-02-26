import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChainConfigService {
  constructor(private configService: ConfigService) {}

  public readonly chainId = this.configService.get<number>('chainId');

  get<T = any>(propertyPath): T | undefined {
    return this.configService.get<T>(`${this.chainId}.${propertyPath}`);
  }

  getData<T = any>(propertyPath): T | undefined {
    return this.configService.get<T>(`${propertyPath}`);
  }
}
