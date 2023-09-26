import { Test } from '@nestjs/testing';
import { HashingService } from './hashing.service';

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HashingService],
    }).compile();

    service = moduleRef.get(HashingService);
  });

  it('should hash data', async () => {
    const pwd = 'password';
    const encrypted = await service.hash(pwd);
    expect(encrypted).toBeDefined();
  });

  it('should compare data to encrypted data', async () => {
    const pwd = 'password';
    const encrypted = await service.hash(pwd);
    const isEqual = await service.compare(pwd, encrypted);
    expect(isEqual).toBe(true);
  });
});
