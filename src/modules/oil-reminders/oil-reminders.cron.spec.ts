import { Test, TestingModule } from '@nestjs/testing';
import { OilRemindersCronService } from './oil-reminders.cron.js';
import { OilRemindersService } from './oil-reminders.service.js';
import { WhatsappService } from '../whatsapp/whatsapp.service.js';
import { jest } from '@jest/globals';

describe('OilRemindersCronService', () => {
  let cronService: OilRemindersCronService;
  // let oilRemindersService: OilRemindersService;

  const mockOilRemindersService = {
    getPendingReminders: jest.fn(),
    processReminder: jest.fn(),
  };

  const mockWhatsappService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OilRemindersCronService,
        { provide: OilRemindersService, useValue: mockOilRemindersService },
        { provide: WhatsappService, useValue: mockWhatsappService },
      ],
    }).compile();

    cronService = module.get<OilRemindersCronService>(OilRemindersCronService);
    // oilRemindersService = module.get<OilRemindersService>(OilRemindersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cronService).toBeDefined();
  });

  describe('processPendingReminders', () => {
    it('should process pending reminders successfully', async () => {
      const reminders = [{ id: '1' }, { id: '2' }];
      (
        mockOilRemindersService.getPendingReminders as jest.Mock<any>
      ).mockResolvedValue(reminders);
      (
        mockOilRemindersService.processReminder as jest.Mock<any>
      ).mockResolvedValue(undefined);

      await cronService.processPendingReminders();

      expect(mockOilRemindersService.getPendingReminders).toHaveBeenCalled();
      expect(mockOilRemindersService.processReminder).toHaveBeenCalledTimes(2);
      expect(mockOilRemindersService.processReminder).toHaveBeenCalledWith(
        '1',
        mockWhatsappService,
      );
      expect(mockOilRemindersService.processReminder).toHaveBeenCalledWith(
        '2',
        mockWhatsappService,
      );
    });

    it('should handle errors during processing independently', async () => {
      const reminders = [{ id: '1' }, { id: '2' }];
      (
        mockOilRemindersService.getPendingReminders as jest.Mock<any>
      ).mockResolvedValue(reminders);

      // First fails, second succeeds
      (mockOilRemindersService.processReminder as jest.Mock<any>)
        .mockRejectedValueOnce(new Error('Process Failed'))
        .mockResolvedValueOnce(undefined);

      await cronService.processPendingReminders();

      expect(mockOilRemindersService.processReminder).toHaveBeenCalledTimes(2);
    });

    it('should handle error getting reminders', async () => {
      (
        mockOilRemindersService.getPendingReminders as jest.Mock<any>
      ).mockRejectedValue(new Error('DB Error'));

      await cronService.processPendingReminders();

      expect(mockOilRemindersService.processReminder).not.toHaveBeenCalled();
    });
  });
});
