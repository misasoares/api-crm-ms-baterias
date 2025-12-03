import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrderBuilder } from '../../../test/builders/order.builder.js';
import { CustomerBuilder } from '../../../test/builders/customer.builder.js';
import { OrderType } from '@prisma/client';

describe('OrdersController Integration', () => {
  let controller: OrdersController;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [OrdersController],
      providers: [OrdersService],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
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
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      const createOrderDto = {
        type: OrderType.OIL,
        vehicle: 'Controller Vehicle',
        product: 'Controller Product',
        customerId: customer.id,
      };

      const result = await controller.create(createOrderDto);
      expect(result).toBeDefined();
      expect(result.vehicle).toBe(createOrderDto.vehicle);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      await new OrderBuilder().withCustomerId(customer.id).build(prisma);
      await new OrderBuilder().withCustomerId(customer.id).build(prisma);

      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      const order = await new OrderBuilder()
        .withCustomerId(customer.id)
        .build(prisma);

      const result = await controller.findOne(order.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(order.id);
    });
  });
});
