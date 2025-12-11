import { Test, TestingModule } from '@nestjs/testing';
import { OilRemindersService } from './oil-reminders.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
// import { WhatsappService } from '../whatsapp/whatsapp.service.js';
import { ReminderStatus } from '@prisma/client';
import { jest } from '@jest/globals';

describe('OilRemindersService', () => {
  let service: OilRemindersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
    },
    oilChangeReminder: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockWhatsappService = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OilRemindersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OilRemindersService>(OilRemindersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReminderForOrder', () => {
    it('should create a reminder successfully', async () => {
      const orderId = 'order-1';
      const order = { id: orderId, createdAt: new Date() };

      (prisma.order.findUnique as jest.Mock<any>).mockResolvedValue(order);

      await service.createReminderForOrder(orderId);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.create).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      (prisma.order.findUnique as jest.Mock<any>).mockResolvedValue(null);

      await expect(
        service.createReminderForOrder('invalid-id'),
      ).rejects.toThrow('Order invalid-id not found');
    });

    it('should adjust date for weekend (Sunday to Monday)', async () => {
      const orderDate = new Date('2023-01-01T10:00:00Z');
      // 2023-01-01 + 6 months -> 2023-07-01 (Saturday). +2 days -> July 3rd (Monday).

      const order = { id: 'order-1', createdAt: orderDate };
      (prisma.order.findUnique as jest.Mock<any>).mockResolvedValue(order);

      await service.createReminderForOrder('order-1');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const callArgs = (prisma.oilChangeReminder.create as jest.Mock).mock
        .calls[0][0] as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const scheduledDate = callArgs.data.scheduledFor;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect(scheduledDate.getDay()).toBe(1); // Monday
    });

    it('should use short duration in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const orderDate = new Date();
      const order = { id: 'order-1', createdAt: orderDate };
      (prisma.order.findUnique as jest.Mock<any>).mockResolvedValue(order);

      await service.createReminderForOrder('order-1');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const callArgs = (prisma.oilChangeReminder.create as jest.Mock).mock
        .calls[0][0] as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const scheduledDate = callArgs.data.scheduledFor;

      // Should be approx 2 min later
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const diff = scheduledDate.getTime() - orderDate.getTime();
      expect(diff).toBeLessThan(5 * 60 * 1000);
      expect(diff).toBeGreaterThan(0);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('processReminder', () => {
    const reminderId = 'reminder-1';
    const reminder = {
      id: reminderId,
      attempts: 0,
      order: {
        customer: { name: 'John', phone: '123' },
        vehicle: 'Car',
      },
    };

    it('should process reminder successfully', async () => {
      (prisma.oilChangeReminder.findUnique as jest.Mock<any>).mockResolvedValue(
        reminder,
      );
      (mockWhatsappService.sendMessage as jest.Mock<any>).mockResolvedValue({
        success: true,
        data: { Id: 'msg-1' },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await service.processReminder(reminderId, mockWhatsappService as any);

      expect(mockWhatsappService.sendMessage).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: reminderId },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ status: ReminderStatus.SENT }),
        }),
      );
    });

    it('should throw error if reminder not found', async () => {
      (prisma.oilChangeReminder.findUnique as jest.Mock<any>).mockResolvedValue(
        null,
      );

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        service.processReminder('invalid', mockWhatsappService as any),
      ).rejects.toThrow('Reminder invalid not found');
    });

    it('should increment attempts on failure', async () => {
      (prisma.oilChangeReminder.findUnique as jest.Mock<any>).mockResolvedValue(
        reminder,
      );
      (mockWhatsappService.sendMessage as jest.Mock<any>).mockRejectedValue(
        new Error('API Error'),
      );

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        service.processReminder(reminderId, mockWhatsappService as any),
      ).rejects.toThrow('API Error');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ attempts: 1 }),
        }),
      );
    });

    it('should mark as failed after 3 attempts', async () => {
      const retryingReminder = { ...reminder, attempts: 2 };

      (prisma.oilChangeReminder.findUnique as jest.Mock<any>).mockResolvedValue(
        retryingReminder,
      );
      (mockWhatsappService.sendMessage as jest.Mock<any>).mockRejectedValue(
        new Error('API Error'),
      );

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        service.processReminder(reminderId, mockWhatsappService as any),
      ).rejects.toThrow('API Error');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({ status: ReminderStatus.FAILED }),
        }),
      );
    });
  });

  describe('cancelPendingReminders', () => {
    it('should cancel pending reminders', async () => {
      (prisma.oilChangeReminder.updateMany as jest.Mock<any>).mockResolvedValue(
        { count: 1 },
      );
      await service.cancelPendingReminders('cust-1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            order: { customerId: 'cust-1', type: 'OIL' },
            status: ReminderStatus.PENDING,
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            status: ReminderStatus.CANCELLED,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            cancelledAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('getPendingReminders', () => {
    it('should return pending reminders', async () => {
      (prisma.oilChangeReminder.findMany as jest.Mock<any>).mockResolvedValue(
        [],
      );
      await service.getPendingReminders();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.findMany).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all reminders', async () => {
      (prisma.oilChangeReminder.findMany as jest.Mock<any>).mockResolvedValue(
        [],
      );
      await service.findAll();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.oilChangeReminder.findMany).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      (prisma.oilChangeReminder.count as jest.Mock<any>).mockResolvedValue(10);
      const stats = await service.getStats();
      expect(stats).toEqual({
        total: 10,
        pending: 10,
        sent: 10,
        cancelled: 10,
        failed: 10,
      });
    });
  });
});
