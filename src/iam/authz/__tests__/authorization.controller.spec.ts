import { Test, TestingModule } from '@nestjs/testing';
import { AuthzController } from '../authorization.controller';

describe('AuthorizationController', () => {
  let controller: AuthzController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthzController],
    }).compile();

    controller = module.get<AuthzController>(AuthzController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
