import { Test, TestingModule } from '@nestjs/testing';
import { OilRemindersController } from './oil-reminders.controller.js';
import { OilRemindersService } from './oil-reminders.service.js';
import { jest } from '@jest/globals';

describe('OilRemindersController', () => {
  let controller: OilRemindersController;
  // let service: OilRemindersService;

  const mockOilRemindersService = {
    findAll: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OilRemindersController],
      providers: [
        {
          provide: OilRemindersService,
          useValue: mockOilRemindersService,
        },
      ],
    }).compile();

    controller = module.get<OilRemindersController>(OilRemindersController);
    // service = module.get<OilRemindersService>(OilRemindersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reminders', async () => {
      const result = [{ id: '1' }];
      (mockOilRemindersService.findAll as jest.Mock<any>).mockResolvedValue(
        result,
      );

      expect(await controller.findAll()).toBe(result);
      expect(mockOilRemindersService.findAll).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      const result = { total: 10 };
      (mockOilRemindersService.getStats as jest.Mock<any>).mockResolvedValue(
        result,
      );

      expect(await controller.getStats()).toBe(result);
      expect(mockOilRemindersService.getStats).toHaveBeenCalled();
    });
  });
});
