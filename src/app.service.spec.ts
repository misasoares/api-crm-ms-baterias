import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service.js';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should return "Hello World!"', () => {
    expect(service.getHello()).toBe('Hello World!');
  });

  it('should return health status', () => {
    const health = service.getHealth();
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('uptime');
  });
});
