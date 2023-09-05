import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthnService } from './google-authentication.service';

describe('GoogleAuthnService', () => {
  let service: GoogleAuthnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAuthnService],
    }).compile();

    service = module.get<GoogleAuthnService>(GoogleAuthnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
