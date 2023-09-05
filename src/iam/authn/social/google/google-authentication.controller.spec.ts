import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthnController } from './google-authentication.controller';

describe('GoogleAuthnController', () => {
  let controller: GoogleAuthnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleAuthnController],
    }).compile();

    controller = module.get<GoogleAuthnController>(GoogleAuthnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
