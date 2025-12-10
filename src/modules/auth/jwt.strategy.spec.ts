import { JwtStrategy } from './jwt.strategy.js';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user payload', () => {
    const payload = { sub: '123', email: 'test@example.com' };
    const result = strategy.validate(payload);
    expect(result).toEqual({ userId: '123', email: 'test@example.com' });
  });
});
