import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrderBuilder } from '../../../test/builders/order.builder.js';
import { CustomerBuilder } from '../../../test/builders/customer.builder.js';
import { OrderType } from '@prisma/client';
import { OilRemindersService } from '../oil-reminders/oil-reminders.service.js';
import { jest } from '@jest/globals';

describe('OrdersService Integration', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockOilRemindersService = {
    createReminderForOrder: jest.fn(),
    cancelPendingReminders: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        OrdersService,
        {
          provide: OilRemindersService,
          useValue: mockOilRemindersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      const createOrderDto = {
        type: OrderType.BATTERY,
        vehicle: 'Test Vehicle',
        product: 'Test Product',
        customerId: customer.id,
      };

      const result = await service.create(createOrderDto);
      expect(result).toBeDefined();
      expect(result.vehicle).toBe(createOrderDto.vehicle);

      const order = await prisma.order.findUnique({ where: { id: result.id } });
      expect(order).toBeDefined();
    });

    it('should create order and new customer if customerId not provided', async () => {
      const createOrderDto = {
        type: OrderType.OIL,
        vehicle: 'Car',
        product: 'Oil',
        customerName: 'New Cust',
        customerPhone: '999888777',
      };

      const result = await service.create(createOrderDto);

      expect(result).toBeDefined();

      const createdCustomer = await prisma.customer.findUnique({
        where: { phone: '999888777' },
      });
      expect(createdCustomer).toBeDefined();
      expect(result.customerId).toBe(createdCustomer?.id);
    });

    it('should throw Error if customerId, name or phone missing', async () => {
      const createOrderDto = {
        type: OrderType.OIL,
        vehicle: 'Car',
        product: 'Oil',
        // Missing customerId, Name, Phone
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(service.create(createOrderDto as any)).rejects.toThrow(
        'Customer name and phone are required',
      );
    });

    it('should throw ConflictException if creating new customer with existing phone', async () => {
      // Create existing customer
      await new CustomerBuilder().withPhone('111222333').build(prisma);

      const createOrderDto = {
        type: OrderType.OIL,
        vehicle: 'Car',
        product: 'Oil',
        customerName: 'New Cust',
        customerPhone: '111222333',
      };

      await expect(service.create(createOrderDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      await new OrderBuilder().withCustomerId(customer.id).build(prisma);
      await new OrderBuilder().withCustomerId(customer.id).build(prisma);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should find an order by id', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      const order = await new OrderBuilder()
        .withCustomerId(customer.id)
        .build(prisma);

      const result = await service.findOne(order.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(order.id);
      expect(result?.customerId).toBe(customer.id);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      jest.spyOn(prisma.order, 'delete').mockResolvedValue({
        id: '1',
        customerId: 'cust1',
        type: OrderType.BATTERY,
        vehicle: 'car',
        product: 'prod',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await service.remove('1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.order.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('update', () => {
    it('should update an order vehicle and product', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      const order = await new OrderBuilder()
        .withCustomerId(customer.id)
        .build(prisma);

      const updateOrderDto = {
        vehicle: 'Updated Vehicle Service',
        product: 'Updated Product Service',
      };

      const result = await service.update(order.id, updateOrderDto);
      expect(result).toBeDefined();
      expect(result.vehicle).toBe(updateOrderDto.vehicle);

      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(updatedOrder?.vehicle).toBe(updateOrderDto.vehicle);
    });
  });
});
