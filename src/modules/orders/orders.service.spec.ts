import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrderBuilder } from '../../../test/builders/order.builder.js';
import { CustomerBuilder } from '../../../test/builders/customer.builder.js';
import { OrderType } from '@prisma/client';

describe('OrdersService Integration', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [OrdersService],
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
    });
  });
});
