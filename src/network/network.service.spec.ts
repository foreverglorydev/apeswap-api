import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetworkService],
    }).compile();

    service = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get network status', () => {
    const status = service.getStatus();
    expect(status == 'green' || status == 'yellow' || status == 'red').toBe(
      true,
    );
  });
});
