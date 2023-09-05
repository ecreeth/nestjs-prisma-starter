import { JwtGuard } from '../jwt.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    expect(new JwtGuard()).toBeDefined();
  });
});
