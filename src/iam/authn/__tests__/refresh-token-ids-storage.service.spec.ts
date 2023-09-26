import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenIdsStorage } from '../refresh-token-ids-storage.service';

describe('RefreshTokenIdsStorageService', () => {
  let service: RefreshTokenIdsStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenIdsStorage],
    }).compile();

    service = module.get<RefreshTokenIdsStorage>(RefreshTokenIdsStorage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
