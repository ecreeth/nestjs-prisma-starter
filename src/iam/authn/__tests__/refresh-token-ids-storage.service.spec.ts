import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenStorage } from '../refresh-token-storage.service';

describe('RefreshTokenStorageService', () => {
  let service: RefreshTokenStorage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenStorage],
    }).compile();

    service = module.get<RefreshTokenStorage>(RefreshTokenStorage);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
